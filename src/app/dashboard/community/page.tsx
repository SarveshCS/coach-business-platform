'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/utils/formatters';
import { VideoPlayerModal } from '@/components/content/VideoPlayerModal';
import {
  Pin,
  Trash2,
  Heart,
  MessageCircle,
  Plus,
  Send,
  Film,
  Play,
} from 'lucide-react';

export default function CoachCommunityPage() {
  const { currentUser } = useAuth();
  const { currentOrganization } = useTenant();
  const {
    communityPosts,
    addCommunityPost,
    deleteCommunityPost,
    togglePinPost,
    toggleLikePost,
    addCommunityComment,
    deleteCommunityComment,
    coachContents,
  } = useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';
  const orgPosts = communityPosts.filter((p) => p.organizationId === orgId);

  const [activeVideo, setActiveVideo] = useState<any>(null);

  // New announcement form
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(true);

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || !currentUser) return;

    addCommunityPost({
      organizationId: orgId,
      authorUserId: currentUser.id,
      authorName: currentUser.name,
      authorRole: 'owner',
      authorAvatar: currentUser.avatar,
      content: postContent,
      imageUrl: postImageUrl || undefined,
      isAnnouncement,
      isPinned: isAnnouncement,
    });

    showToast(
      isAnnouncement ? 'Announcement Published' : 'Post Shared',
      'Visible to all members of your organization.',
      'success'
    );

    setIsNewPostOpen(false);
    setPostContent('');
    setPostImageUrl('');
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text || !currentUser) return;

    addCommunityComment(postId, {
      postId,
      authorUserId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      content: text,
    });

    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Organization Community & Feed
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Private community space for member engagement, challenges, and announcements.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewPostOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Post Announcement
          </Button>
        </div>

        {/* Community Feed */}
        <div className="flex flex-col gap-6">
          {orgPosts.length === 0 ? (
            <Card className="p-12 text-center text-xs text-slate-500 bg-white">
              No community posts yet. Publish an announcement to welcome your trainees!
            </Card>
          ) : (
            orgPosts.map((post) => (
              <Card
                key={post.id}
                className={`bg-white border-slate-200 shadow-2xs ${post.isPinned ? 'border-teal-500/70 ring-1 ring-teal-500/30' : ''}`}
              >
                {/* Author & Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs text-teal-700 shrink-0">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                      ) : (
                        post.authorName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{post.authorName}</h4>
                        <Badge variant={post.authorRole === 'owner' ? 'info' : 'default'} size="xs">
                          {post.authorRole === 'owner' ? 'Coach' : 'Member'}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {post.isPinned && (
                      <Badge variant="info" size="xs" className="flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </Badge>
                    )}
                    <button
                      onClick={() => togglePinPost(post.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-teal-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title={post.isPinned ? 'Unpin' : 'Pin Post'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        deleteCommunityPost(post.id);
                        showToast('Post Removed', 'Deleted from community feed', 'info');
                      }}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Coach Content Distinct Banner if shared from Coach Content */}
                {post.isFromCoachContent && (
                  <div className="mb-3 p-3 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                        <Film className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[11px] font-bold text-teal-900">
                        Official Coach Library Content
                      </span>
                    </div>

                    {post.coachContentId && (
                      (() => {
                        const linked = coachContents.find((c) => c.id === post.coachContentId);
                        if (!linked) {
                          return (
                            <span className="text-[10px] text-slate-400 italic">
                              Content archived / deleted
                            </span>
                          );
                        }
                        return (
                          <Button
                            type="button"
                            variant="primary"
                            size="xs"
                            onClick={() => setActiveVideo(linked)}
                            className="flex items-center gap-1 text-[11px] py-1 px-2.5"
                          >
                            <Play className="w-3 h-3" /> Preview Media
                          </Button>
                        );
                      })()
                    )}
                  </div>
                )}

                {/* Content */}
                <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed mb-4">
                  {post.content}
                </p>

                {/* Attached Image */}
                {post.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 mb-4 max-h-96">
                    <img src={post.imageUrl} alt="Post media" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Like / Comment stats */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-3">
                  <button
                    onClick={() => currentUser && toggleLikePost(post.id, currentUser.id)}
                    className="flex items-center gap-1.5 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-50" />
                    <span className="font-semibold">{post.likesCount} Likes</span>
                  </button>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments.length} Comments</span>
                  </span>
                </div>

                {/* Comments Thread */}
                <div className="flex flex-col gap-2.5 pt-2">
                  {post.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-teal-700 shrink-0">
                          {comment.authorName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900">{comment.authorName}</span>
                          <p className="text-slate-700 mt-0.5">{comment.content}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCommunityComment(post.id, comment.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add Comment Input */}
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      placeholder="Write a coach reply..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                      }
                      className="text-xs py-1.5"
                    />
                    <Button variant="primary" size="sm" onClick={() => handleAddComment(post.id)}>
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Create Post Modal */}
        <Modal
          isOpen={isNewPostOpen}
          onClose={() => setIsNewPostOpen(false)}
          title="Create Community Post / Announcement"
          description="Broadcast a message, weekly goal, or photo to all members of your organization."
          maxWidth="md"
        >
          <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
            <Textarea
              label="Post Content"
              required
              rows={4}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's happening this week? Share motivation, tips, or announcements..."
            />

            <Input
              label="Image URL (Optional)"
              value={postImageUrl}
              onChange={(e) => setPostImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isAnnouncement}
                onChange={(e) => setIsAnnouncement(e.target.checked)}
                className="rounded border-slate-300 text-teal-700 focus:ring-teal-700"
              />
              <span>Pin as Highlighted Announcement</span>
            </label>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsNewPostOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Publish Post
              </Button>
            </div>
          </form>
        </Modal>
      </div>

      {/* Video Player Modal for shared coach content */}
      <VideoPlayerModal
        isOpen={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        content={activeVideo}
        currentUserId={currentUser?.id}
        isCoach={true}
      />
    </DashboardLayout>
  );
}
