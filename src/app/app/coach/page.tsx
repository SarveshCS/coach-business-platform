'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClientAppLayout } from '@/components/layout/ClientAppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { VideoPlayerModal } from '@/components/content/VideoPlayerModal';
import { ShortsPlayerModal } from '@/components/content/ShortsPlayerModal';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { CoachContent } from '@/types';
import { formatDuration } from '@/utils/contentRules';
import {
  Film,
  ArrowLeft,
  Search,
  Play,
  Heart,
  CheckCircle2,
  Trophy,
  Eye,
} from 'lucide-react';

export default function MemberCoachContentPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { currentOrganization } = useTenant();
  const { coachContents } = useData();

  const orgId = currentOrganization?.id || 'org_1';

  // Filters & State
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [activeVideo, setActiveVideo] = useState<CoachContent | null>(null);
  const [shortsOpen, setShortsOpen] = useState(false);
  const [activeShortId, setActiveShortId] = useState<string | undefined>(undefined);

  // Filter organization-scoped published member content
  const orgContents = useMemo(() => {
    return coachContents.filter(
      (c) => c.organizationId === orgId && c.status === 'published' && c.visibility === 'members'
    );
  }, [coachContents, orgId]);

  // Filtered by tab and search
  const filteredContents = useMemo(() => {
    return orgContents.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }

      // Filter tabs
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'video' || selectedFilter === 'short' || selectedFilter === 'achievement') {
        return item.type === selectedFilter;
      }
      return item.category === selectedFilter;
    });
  }, [orgContents, selectedFilter, searchQuery]);

  const shortsList = useMemo(() => orgContents.filter((c) => c.type === 'short'), [orgContents]);

  const handleCardClick = (item: CoachContent) => {
    if (item.type === 'short') {
      setActiveShortId(item.id);
      setShortsOpen(true);
    } else {
      setActiveVideo(item);
    }
  };

  const FILTER_TABS = [
    { id: 'all', label: 'All' },
    { id: 'video', label: 'Videos' },
    { id: 'short', label: 'Shorts' },
    { id: 'technique', label: 'Form & Cues' },
    { id: 'workout', label: 'Workouts' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'motivation', label: 'Mindset' },
    { id: 'achievement', label: 'Achievements' },
    { id: 'transformation', label: 'Results' },
  ];

  return (
    <ClientAppLayout>
      <div className="flex flex-col gap-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">Coach Content</h1>
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
              </div>
              <p className="text-[11px] text-slate-500">
                Curated videos, form guides, and nutrition tips from your coach.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-teal-700" />
          </div>
          <input
            type="text"
            placeholder="Search exercises, form cues, nutrition tips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear search"
            >
              <span className="w-4 h-4 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[10px]">✕</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_TABS.map((tab) => {
            const isSelected = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Grid */}
        {filteredContents.length === 0 ? (
          <div className="border border-slate-200 rounded-2xl bg-white p-10 text-center flex flex-col items-center justify-center">
            <Film className="w-10 h-10 text-slate-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No content in this category</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try selecting another category or clear your search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredContents.map((item) => {
              const isShort = item.type === 'short';
              return (
                <Card
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className="p-0 overflow-hidden border-slate-200 bg-white hover:border-teal-700 cursor-pointer group flex flex-col justify-between transition-all shadow-2xs"
                >
                  {/* Thumbnail */}
                  <div className={`relative ${isShort ? 'aspect-[4/3]' : 'aspect-video'} w-full bg-slate-900 overflow-hidden`}>
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                        {item.type === 'achievement' ? <Trophy className="w-8 h-8 text-amber-400" /> : <Film className="w-8 h-8" />}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Play icon overlay */}
                    {(item.type === 'video' || item.type === 'short') && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-teal-700/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                      <Badge variant="info" size="xs">
                        {item.category.toUpperCase()}
                      </Badge>

                      {item.featured && (
                        <span className="text-[9px] font-bold uppercase text-amber-300 bg-slate-900/80 border border-amber-500/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                          FEATURED
                        </span>
                      )}
                    </div>

                    {/* Duration badge */}
                    {item.durationSeconds ? (
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-white font-bold backdrop-blur-sm">
                        {formatDuration(item.durationSeconds)}
                      </div>
                    ) : null}
                  </div>

                  {/* Body */}
                  <div className="p-3.5 flex flex-col gap-2">
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-teal-800 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-slate-400" />
                          {item.viewsCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500" />
                          {item.likesCount}
                        </span>
                      </div>

                      <span className="text-slate-400 font-mono">
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        content={activeVideo}
        currentUserId={currentUser?.id}
      />

      {/* Shorts Player Modal */}
      <ShortsPlayerModal
        isOpen={shortsOpen}
        onClose={() => setShortsOpen(false)}
        shorts={shortsList}
        initialShortId={activeShortId}
        currentUserId={currentUser?.id}
      />
    </ClientAppLayout>
  );
}
