'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { VideoPlayerModal } from '@/components/content/VideoPlayerModal';
import { ShortsPlayerModal } from '@/components/content/ShortsPlayerModal';
import { useData } from '@/context/DataContext';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { CoachContent, CoachContentType } from '@/types';
import { formatBytes, formatDuration } from '@/utils/contentRules';
import {
  Video,
  Plus,
  Search,
  Play,
  Film,
  Image as ImageIcon,
  FileText,
  Trophy,
  Megaphone,
  Star,
  Share2,
  Edit,
  Trash2,
  Eye,
  Heart,
  HardDrive,
  Grid,
  List,
  AlertTriangle,
  Smartphone,
} from 'lucide-react';

export default function CoachContentLibraryPage() {
  const router = useRouter();
  const { currentOrganization } = useTenant();
  const { currentUser } = useAuth();
  const {
    coachContents,
    deleteCoachContent,
    toggleFeatureContent,
    shareContentToCommunity,
    getOrganizationStorage,
  } = useData();
  const { showToast } = useToast();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'likes'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Preview Modals
  const [previewContent, setPreviewContent] = useState<CoachContent | null>(null);
  const [shortPlayerOpen, setShortPlayerOpen] = useState(false);
  const [activeShortId, setActiveShortId] = useState<string | undefined>(undefined);

  // Delete Confirmation Modal
  const [contentToDelete, setContentToDelete] = useState<CoachContent | null>(null);

  const orgId = currentOrganization?.id || 'org_1';
  const orgContents = useMemo(
    () => coachContents.filter((c) => c.organizationId === orgId),
    [coachContents, orgId]
  );

  const storage = useMemo(() => getOrganizationStorage(orgId), [getOrganizationStorage, orgId]);

  // Filtered & Sorted Content List
  const filteredContents = useMemo(() => {
    return orgContents
      .filter((item) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = item.title.toLowerCase().includes(q);
          const matchesDesc = item.description.toLowerCase().includes(q);
          const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesTags) return false;
        }

        // Type
        if (selectedType !== 'all' && item.type !== selectedType) return false;

        // Category
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

        // Status
        if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;

        // Featured
        if (featuredOnly && !item.featured) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'views') return b.viewsCount - a.viewsCount;
        if (sortBy === 'likes') return b.likesCount - a.likesCount;
        return 0;
      });
  }, [orgContents, searchQuery, selectedType, selectedCategory, selectedStatus, featuredOnly, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = orgContents.length;
    const published = orgContents.filter((c) => c.status === 'published').length;
    const drafts = orgContents.filter((c) => c.status === 'draft').length;
    const featured = orgContents.filter((c) => c.featured).length;
    const videos = orgContents.filter((c) => c.type === 'video').length;
    const shorts = orgContents.filter((c) => c.type === 'short').length;
    return { total, published, drafts, featured, videos, shorts };
  }, [orgContents]);

  // Shorts list for Shorts player
  const orgShorts = useMemo(
    () => orgContents.filter((c) => c.type === 'short' && c.status === 'published'),
    [orgContents]
  );

  const handleOpenPreview = (item: CoachContent) => {
    if (item.type === 'short') {
      setActiveShortId(item.id);
      setShortPlayerOpen(true);
    } else {
      setPreviewContent(item);
    }
  };

  const handleShare = (item: CoachContent) => {
    const res = shareContentToCommunity(item.id);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleDeleteConfirm = () => {
    if (contentToDelete) {
      deleteCoachContent(contentToDelete.id);
      showToast(`Deleted "${contentToDelete.title}" and freed storage.`, 'info');
      setContentToDelete(null);
    }
  };

  const getTypeIcon = (type: CoachContentType) => {
    switch (type) {
      case 'video':
        return <Film className="w-4 h-4 text-teal-700" />;
      case 'short':
        return <Smartphone className="w-4 h-4 text-indigo-600" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-600" />;
      case 'post':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-600" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-rose-600" />;
      default:
        return <Video className="w-4 h-4 text-teal-700" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header with Title & CTAs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Coach Content & Media Library
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Upload, organize, and distribute instructional videos, shorts, and guides for your trainees.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/content/create">
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Create Content
              </Button>
            </Link>
          </div>
        </div>

        {/* Organization Media Storage Summary Bar */}
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-700 border border-teal-100">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Organization Cloud Storage</h3>
                <p className="text-[11px] text-slate-500">
                  {formatBytes(storage.usedBytes)} of {formatBytes(storage.limitBytes)} used ({Math.round((storage.usedBytes / (storage.limitBytes || 1)) * 100)}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                Videos ({formatBytes(storage.breakdown.videosBytes)})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                Shorts ({formatBytes(storage.breakdown.shortsBytes)})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Images ({formatBytes(storage.breakdown.imagesBytes)})
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
            <div
              className="bg-teal-600 h-full transition-all duration-300"
              style={{ width: `${(storage.breakdown.videosBytes / (storage.limitBytes || 1)) * 100}%` }}
              title={`Videos: ${formatBytes(storage.breakdown.videosBytes)}`}
            />
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${(storage.breakdown.shortsBytes / (storage.limitBytes || 1)) * 100}%` }}
              title={`Shorts: ${formatBytes(storage.breakdown.shortsBytes)}`}
            />
            <div
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: `${(storage.breakdown.imagesBytes / (storage.limitBytes || 1)) * 100}%` }}
              title={`Images: ${formatBytes(storage.breakdown.imagesBytes)}`}
            />
          </div>
        </Card>

        {/* Quick Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <Card className="p-3 bg-white flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Items</span>
            <span className="text-lg font-bold text-slate-900">{stats.total}</span>
          </Card>
          <Card className="p-3 bg-white flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Published</span>
            <span className="text-lg font-bold text-emerald-700">{stats.published}</span>
          </Card>
          <Card className="p-3 bg-white flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Drafts</span>
            <span className="text-lg font-bold text-amber-700">{stats.drafts}</span>
          </Card>
          <Card className="p-3 bg-white flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Featured</span>
            <span className="text-lg font-bold text-slate-900">{stats.featured}</span>
          </Card>
          <Card className="p-3 bg-white flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Full Videos</span>
            <span className="text-lg font-bold text-teal-700">{stats.videos}</span>
          </Card>
          <Card className="p-3 bg-white flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Shorts</span>
            <span className="text-lg font-bold text-indigo-700">{stats.shorts}</span>
          </Card>
        </div>

        {/* Content Type Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Content' },
            { id: 'video', label: 'Videos', icon: Film },
            { id: 'short', label: 'Shorts', icon: Smartphone },
            { id: 'image', label: 'Images', icon: ImageIcon },
            { id: 'achievement', label: 'Achievements', icon: Trophy },
            { id: 'announcement', label: 'Announcements', icon: Megaphone },
            { id: 'post', label: 'Text Posts', icon: FileText },
          ].map((tab) => {
            const isSelected = selectedType === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-xs font-bold'
                    : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search, Category, Status & Sort Toolbar */}
        <Card className="p-3.5 bg-white shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-teal-700" />
              </div>
              <input
                type="text"
                placeholder="Search videos, techniques, nutrition, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Clear search"
                >
                  <span className="w-4 h-4 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[10px]">✕</span>
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-all cursor-pointer font-medium"
              >
                <option value="all">All Categories</option>
                <option value="workout">Workout</option>
                <option value="technique">Exercise Technique</option>
                <option value="nutrition">Nutrition</option>
                <option value="education">Education</option>
                <option value="motivation">Motivation</option>
                <option value="transformation">Transformation</option>
                <option value="achievement">Achievement</option>
                <option value="general">General</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:w-auto bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-all cursor-pointer font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Featured Only Toggle Button */}
            <button
              onClick={() => setFeaturedOnly(!featuredOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                featuredOnly
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${featuredOnly ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
              <span>Featured</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-all cursor-pointer font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="views">Most Viewed</option>
              <option value="likes">Most Liked</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                aria-label="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Card>

        {/* Content Items List / Grid */}
        {filteredContents.length === 0 ? (
          <div className="border border-slate-200 rounded-xl bg-white p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No content matches your filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Try adjusting your search query, type, or category filters, or publish a new video for your trainees.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push('/dashboard/content/create')}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Create New Content
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContents.map((item) => {
              const isVideo = item.type === 'video' || item.type === 'short';
              return (
                <Card
                  key={item.id}
                  className="group flex flex-col justify-between overflow-hidden p-0 bg-white border-slate-200/90 hover:border-slate-300 transition-all shadow-2xs"
                >
                  {/* Thumbnail / Header Area */}
                  <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                        {getTypeIcon(item.type)}
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 uppercase flex items-center gap-1">
                          {getTypeIcon(item.type)}
                          <span>{item.type}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-slate-200 border border-white/10 uppercase">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.status === 'draft' && (
                          <Badge variant="warning" size="xs">
                            DRAFT
                          </Badge>
                        )}
                        {item.status === 'archived' && (
                          <Badge variant="default" size="xs">
                            ARCHIVED
                          </Badge>
                        )}
                        {item.featured && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-900 font-bold text-[10px]">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Play Button Overlay for Videos/Shorts */}
                    {isVideo && (
                      <button
                        onClick={() => handleOpenPreview(item)}
                        className="absolute inset-0 flex items-center justify-center group/btn cursor-pointer"
                        aria-label="Preview video"
                      >
                        <div className="w-11 h-11 rounded-full bg-teal-700 group-hover/btn:bg-teal-800 text-white flex items-center justify-center shadow-lg transform group-hover/btn:scale-105 transition-all">
                          <Play className="w-4 h-4 ml-0.5" />
                        </div>
                      </button>
                    )}

                    {/* Duration / Size at Bottom of Thumbnail */}
                    <div className="absolute bottom-2 inset-x-2.5 flex items-center justify-between text-[11px] font-mono text-slate-200">
                      <span>{formatBytes(item.storageSizeBytes)}</span>
                      {item.durationSeconds ? (
                        <span className="bg-black/70 px-1.5 py-0.5 rounded backdrop-blur-sm text-white font-semibold">
                          {formatDuration(item.durationSeconds)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h4
                        onClick={() => handleOpenPreview(item)}
                        className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-teal-700 transition-colors cursor-pointer"
                      >
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Engagement & Metrics */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {item.viewsCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          {item.likesCount}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Draft'}
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {/* Preview */}
                      <button
                        onClick={() => handleOpenPreview(item)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                        title="Preview Content"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Feature */}
                      <button
                        onClick={() => toggleFeatureContent(item.id)}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                          item.featured
                            ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                            : 'text-slate-400 hover:text-amber-600 hover:bg-slate-200'
                        }`}
                        title={item.featured ? 'Unfeature content' : 'Feature content'}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.featured ? 'fill-amber-500' : ''}`} />
                      </button>

                      {/* Share to Community */}
                      <button
                        onClick={() => handleShare(item)}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                          item.communityShared
                            ? 'text-teal-700 bg-teal-50'
                            : 'text-slate-400 hover:text-teal-700 hover:bg-slate-200'
                        }`}
                        title={item.communityShared ? 'Shared to Community Feed' : 'Share to Community Feed'}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Edit */}
                      <Link
                        href={`/dashboard/content/${item.id}`}
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                        title="Edit Content"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => setContentToDelete(item)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Content"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="flex flex-col gap-2">
            {filteredContents.map((item) => (
              <Card
                key={item.id}
                className="p-3.5 bg-white border-slate-200 hover:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="relative w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">{getTypeIcon(item.type)}</div>
                    )}
                    {(item.type === 'video' || item.type === 'short') && (
                      <button
                        onClick={() => handleOpenPreview(item)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white hover:bg-black/20 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        onClick={() => handleOpenPreview(item)}
                        className="text-xs sm:text-sm font-bold text-slate-900 truncate hover:text-teal-700 cursor-pointer transition-colors"
                      >
                        {item.title}
                      </h4>
                      <Badge variant="info" size="xs">
                        {item.category.toUpperCase()}
                      </Badge>
                      {item.featured && (
                        <Badge variant="warning" size="xs">
                          Featured
                        </Badge>
                      )}
                      {item.status === 'draft' && (
                        <Badge variant="warning" size="xs">
                          Draft
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5 max-w-xl">{item.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                      <span>{formatBytes(item.storageSizeBytes)}</span>
                      {item.durationSeconds ? <span>• {formatDuration(item.durationSeconds)}</span> : null}
                      <span>• {item.viewsCount} views</span>
                      <span>• {item.likesCount} likes</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleOpenPreview(item)}
                    className="cursor-pointer"
                  >
                    Preview
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => router.push(`/dashboard/content/${item.id}`)}
                    className="cursor-pointer"
                  >
                    Edit
                  </Button>
                  <button
                    onClick={() => handleShare(item)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-teal-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Share to community"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setContentToDelete(item)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete content"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={!!previewContent}
        onClose={() => setPreviewContent(null)}
        content={previewContent}
        currentUserId={currentUser?.id}
        isCoach={true}
      />

      {/* Shorts Player Modal */}
      <ShortsPlayerModal
        isOpen={shortPlayerOpen}
        onClose={() => setShortPlayerOpen(false)}
        shorts={orgShorts}
        initialShortId={activeShortId}
        currentUserId={currentUser?.id}
        isCoach={true}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!contentToDelete}
        onClose={() => setContentToDelete(null)}
        title="Delete Coach Content"
        description="This action cannot be undone. Media will be deleted and storage will be returned to your quota."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setContentToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
              Delete Content
            </Button>
          </>
        }
      >
        {contentToDelete && (
          <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">{contentToDelete.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Type: {contentToDelete.type} • Size: {formatBytes(contentToDelete.storageSizeBytes)}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
