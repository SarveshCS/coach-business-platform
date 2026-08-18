'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { MediaUploader, MediaUploadResult } from '@/components/content/MediaUploader';
import { useData } from '@/context/DataContext';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { CoachContentType, CoachContentCategory, CoachContentVisibility } from '@/types';
import {
  Film,
  Smartphone,
  Image as ImageIcon,
  FileText,
  Trophy,
  Megaphone,
  ArrowLeft,
  Share2,
  Star,
  Shield,
  Save,
  Send,
} from 'lucide-react';

export default function CreateCoachContentPage() {
  const router = useRouter();
  const { currentOrganization } = useTenant();
  const { currentUser } = useAuth();
  const { addCoachContent, shareContentToCommunity, getOrganizationStorage } = useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';
  const storage = getOrganizationStorage(orgId);

  // Form State
  const [contentType, setContentType] = useState<CoachContentType>('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CoachContentCategory>('technique');
  const [tagsInput, setTagsInput] = useState('Form, Masterclass');
  const [visibility, setVisibility] = useState<CoachContentVisibility>('members');
  const [featured, setFeatured] = useState(false);
  const [shareImmediately, setShareImmediately] = useState(true);

  // Media state
  const [uploadedMedia, setUploadedMedia] = useState<MediaUploadResult | null>(null);

  const isMediaRequired = contentType === 'video' || contentType === 'short' || contentType === 'image' || contentType === 'achievement';

  const handleSave = (publish: boolean) => {
    if (!title.trim()) {
      showToast('Please enter a content title.', 'error');
      return;
    }
    if (!description.trim()) {
      showToast('Please provide a description or caption.', 'error');
      return;
    }
    if (isMediaRequired && !uploadedMedia) {
      showToast(`Please upload or select media for this ${contentType}.`, 'error');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newContent = addCoachContent({
      organizationId: orgId,
      authorId: currentUser?.id || 'usr_coach_1',
      authorName: currentUser?.name || 'Coach',
      authorAvatar: currentUser?.avatar,
      type: contentType,
      title: title.trim(),
      description: description.trim(),
      mediaUrl: uploadedMedia?.mediaUrl,
      thumbnailUrl: uploadedMedia?.thumbnailUrl,
      durationSeconds: uploadedMedia?.durationSeconds,
      storageSizeBytes: uploadedMedia?.storageSizeBytes || 1048576,
      category,
      tags,
      status: publish ? 'published' : 'draft',
      visibility,
      featured,
    });

    if (publish && shareImmediately && visibility === 'members') {
      shareContentToCommunity(newContent.id);
    }

    showToast(
      publish ? `Published "${title}" successfully!` : `Saved "${title}" as draft.`,
      'success'
    );
    router.push('/dashboard/content');
  };

  const TYPE_OPTIONS: { type: CoachContentType; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { type: 'video', label: 'Long-form Video', icon: Film, desc: 'Full workout tutorials, technique breakdowns, lectures' },
    { type: 'short', label: 'Vertical Short', icon: Smartphone, desc: 'Quick 30-60s form cues, daily mindset, bite-sized recipes' },
    { type: 'image', label: 'Photo / Infographic', icon: ImageIcon, desc: 'Transformation photos, infographics, macro cheatsheets' },
    { type: 'achievement', label: 'Coach Milestone', icon: Trophy, desc: 'Certifications, tournament wins, gym records' },
    { type: 'announcement', label: 'Announcement', icon: Megaphone, desc: 'Camp schedules, holiday hours, challenge kickoffs' },
    { type: 'post', label: 'Text Lesson', icon: FileText, desc: 'Coaching philosophy, training guidelines, Q&A' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/content"
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Coach Content</h1>
              <p className="text-xs text-slate-500">
                Publish persistent media and educational content for your organization.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Content Type Selector */}
        <Card className="p-5 bg-white">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Select Content Type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TYPE_OPTIONS.map((opt) => {
              const isSelected = contentType === opt.type;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => {
                    setContentType(opt.type);
                    setUploadedMedia(null);
                  }}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-teal-50/60 border-teal-700 ring-1 ring-teal-700'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-md ${isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && <Badge variant="active" size="xs">Active</Badge>}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{opt.label}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* 2. Media Upload Section */}
        {isMediaRequired && (
          <Card className="p-5 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                2. Upload or Select Media Asset *
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Storage: {Math.round((storage.usedBytes / (storage.limitBytes || 1)) * 100)}% used
              </span>
            </div>

            <MediaUploader
              contentType={contentType}
              currentUsedBytes={storage.usedBytes}
              storageLimitBytes={storage.limitBytes}
              initialMedia={uploadedMedia}
              onMediaReady={setUploadedMedia}
            />
          </Card>
        )}

        {/* 3. Content Details & Metadata */}
        <Card className="p-5 bg-white flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {isMediaRequired ? '3. Content Metadata & Details' : '2. Content Details'}
          </h3>

          <div className="flex flex-col gap-3.5">
            <Input
              label="Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deadlift Setup: Perfecting Hip Hinge & Lat Engagement"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description / Educational Notes *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed cues, timestamps, or full article text for your trainees..."
                className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 cursor-pointer"
                >
                  <option value="technique">Exercise Technique</option>
                  <option value="workout">Full Workout</option>
                  <option value="nutrition">Nutrition & Diet</option>
                  <option value="education">Education & Science</option>
                  <option value="motivation">Mindset & Motivation</option>
                  <option value="transformation">Client Transformation</option>
                  <option value="achievement">Achievement & Milestone</option>
                  <option value="general">General Coaching</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Audience Access</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 cursor-pointer"
                >
                  <option value="members">All Organization Members</option>
                  <option value="coach_only">Coach Only (Private Drafts)</option>
                </select>
              </div>
            </div>

            <Input
              label="Tags (comma-separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Deadlift, Form, Technique, Strength"
            />
          </div>
        </Card>

        {/* 4. Distribution & Community Sharing */}
        <Card className="p-5 bg-white flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {isMediaRequired ? '4. Distribution Settings' : '3. Distribution Settings'}
          </h3>

          {/* Featured Hero Toggle */}
          <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Pin as Featured Hero Content</h4>
                <p className="text-[11px] text-slate-500">
                  Highlight this item at the top of the client Trainee Home screen.
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

          {/* Share to Community Feed Toggle */}
          <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-teal-700 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Share to Community Feed on Publish</h4>
                <p className="text-[11px] text-slate-500">
                  Cross-post this lesson directly to your organization social feed.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={shareImmediately}
              onChange={(e) => setShareImmediately(e.target.checked)}
              className="w-4 h-4 rounded text-teal-700 focus:ring-teal-700 border-slate-300"
            />
          </label>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link href="/dashboard/content">
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSave(false)}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleSave(true)}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Publish Content
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
