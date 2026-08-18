'use client';

import React, { useState, use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { MediaUploader, MediaUploadResult } from '@/components/content/MediaUploader';
import { VideoPlayerModal } from '@/components/content/VideoPlayerModal';
import { useData } from '@/context/DataContext';
import { useTenant } from '@/context/TenantContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { CoachContent, CoachContentType, CoachContentCategory, CoachContentStatus, CoachContentVisibility } from '@/types';
import { formatBytes } from '@/utils/contentRules';
import {
  ArrowLeft,
  Share2,
  Star,
  Save,
  Trash2,
  Play,
  Eye,
  Heart,
  Bookmark,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export default function EditCoachContentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { currentOrganization } = useTenant();
  const { currentUser } = useAuth();
  const { coachContents, updateCoachContent, deleteCoachContent, shareContentToCommunity, getOrganizationStorage } =
    useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';
  const storage = getOrganizationStorage(orgId);

  const content = useMemo(
    () => coachContents.find((c) => c.id === resolvedParams.id),
    [coachContents, resolvedParams.id]
  );

  // Form State
  const [title, setTitle] = useState(content?.title || '');
  const [description, setDescription] = useState(content?.description || '');
  const [category, setCategory] = useState<CoachContentCategory>(content?.category || 'technique');
  const [status, setStatus] = useState<CoachContentStatus>(content?.status || 'published');
  const [visibility, setVisibility] = useState<CoachContentVisibility>(content?.visibility || 'members');
  const [tagsInput, setTagsInput] = useState(content?.tags?.join(', ') || '');
  const [featured, setFeatured] = useState(content?.featured || false);

  // Media state
  const [uploadedMedia, setUploadedMedia] = useState<MediaUploadResult | null>(
    content
      ? {
          mediaUrl: content.mediaUrl || '',
          thumbnailUrl: content.thumbnailUrl || '',
          durationSeconds: content.durationSeconds,
          storageSizeBytes: content.storageSizeBytes,
          fileName: `${content.title} (${content.type})`,
        }
      : null
  );

  // Modals
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  if (!content) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold text-slate-900">Content Not Found</h2>
          <p className="text-xs text-slate-500 mt-2">
            The requested content item may have been deleted or does not exist.
          </p>
          <Button variant="primary" size="sm" onClick={() => router.push('/dashboard/content')} className="mt-4">
            Back to Content Library
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleSave = () => {
    if (!title.trim()) {
      showToast('Title cannot be empty.', 'error');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    updateCoachContent(content.id, {
      title: title.trim(),
      description: description.trim(),
      category,
      status,
      visibility,
      tags,
      featured,
      mediaUrl: uploadedMedia?.mediaUrl || content.mediaUrl,
      thumbnailUrl: uploadedMedia?.thumbnailUrl || content.thumbnailUrl,
      durationSeconds: uploadedMedia?.durationSeconds || content.durationSeconds,
      storageSizeBytes: uploadedMedia?.storageSizeBytes || content.storageSizeBytes,
    });

    showToast('Content updated successfully.', 'success');
    router.push('/dashboard/content');
  };

  const handleShare = () => {
    const res = shareContentToCommunity(content.id);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleDeleteConfirm = () => {
    deleteCoachContent(content.id);
    showToast(`Deleted "${content.title}".`, 'info');
    router.push('/dashboard/content');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/content"
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Edit Content</h1>
                <Badge variant="info" size="xs">
                  {content.type.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage metadata, media files, visibility status, and community feed sharing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" /> Preview
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </div>
        </div>

        {/* Analytics & Performance Quick Bar */}
        <Card className="p-4 bg-white border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Member Views</p>
              <p className="text-base font-bold text-slate-900">{content.viewsCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Likes</p>
              <p className="text-base font-bold text-slate-900">{content.likesCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Bookmarks</p>
              <p className="text-base font-bold text-slate-900">{content.bookmarksCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Published</p>
              <p className="text-xs font-bold text-slate-700">
                {content.publishedAt ? new Date(content.publishedAt).toLocaleDateString() : 'Draft'}
              </p>
            </div>
          </div>
        </Card>

        {/* Media Inspector / Replace */}
        {(content.type === 'video' || content.type === 'short' || content.type === 'image' || content.type === 'achievement') && (
          <Card className="p-5 bg-white border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Media Asset</h3>
              <span className="text-xs text-slate-500 font-mono">
                Storage: {formatBytes(content.storageSizeBytes)}
              </span>
            </div>

            <MediaUploader
              contentType={content.type}
              currentUsedBytes={storage.usedBytes}
              storageLimitBytes={storage.limitBytes}
              initialMedia={uploadedMedia}
              onMediaReady={setUploadedMedia}
            />
          </Card>
        )}

        {/* Content Details */}
        <Card className="p-5 bg-white flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Content Details & Text</h3>

          <div className="flex flex-col gap-3.5">
            <Input
              label="Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description / Body *</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 cursor-pointer"
                >
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 cursor-pointer"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Audience</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 cursor-pointer"
                >
                  <option value="members">All Org Members</option>
                  <option value="coach_only">Coach Only (Private)</option>
                </select>
              </div>
            </div>

            <Input
              label="Tags (comma-separated)"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full text-xs"
            />
          </div>
        </Card>

        {/* Visibility, Community & Featured Toggles */}
        <Card className="p-5 bg-white flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Distribution & Community</h3>

          {/* Featured Toggle */}
          <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Featured Hero Content</h4>
                <p className="text-[11px] text-slate-500">
                  Highlight this item at the top of the client Trainee Home screen
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-teal-700 focus:ring-teal-700 border-slate-300"
            />
          </label>

          {/* Share to Community Button */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-teal-700 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Community Feed Cross-Post</h4>
                <p className="text-[11px] text-slate-500">
                  {content.communityShared
                    ? 'Already shared to community feed with social interaction enabled'
                    : 'Publish a social post linked to this coach content'}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant={content.communityShared ? 'outline' : 'secondary'}
              size="xs"
              onClick={handleShare}
              disabled={status !== 'published'}
            >
              {content.communityShared ? 'Re-sync Feed' : 'Share to Community'}
            </Button>
          </div>
        </Card>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button type="button" variant="outline" size="md" onClick={() => router.push('/dashboard/content')}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSave}
            className="flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        content={content}
        currentUserId={currentUser?.id}
        isCoach={true}
      />

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Content"
        description="Are you sure you want to delete this coaching content? Media will be deleted and storage freed."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </>
        }
      >
        <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-900">{content.title}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Size: {formatBytes(content.storageSizeBytes)}</p>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
