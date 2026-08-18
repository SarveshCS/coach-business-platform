'use client';

import React, { useState } from 'react';
import { ClientAppLayout } from '@/components/layout/ClientAppLayout';
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
  Heart,
  MessageCircle,
  Plus,
  Send,
  Pin,
  AlertTriangle,
  Flag,
  Play,
  Film,
} from 'lucide-react';

export default function ClientCommunityPage() {
  const { currentUser } = useAuth();
  const { currentOrganization, isCommunityBanned } = useTenant();
  const {
    communityPosts,
    addCommunityPost,
    toggleLikePost,
    addCommunityComment,
    reportPost,
    coachContents,
  } = useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';
  const orgPosts = communityPosts.filter((p) => p.organizationId === orgId);

  const [activeVideo, setActiveVideo] = useState<any>(null);

  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCommunityBanned) {
      showToast('Action Blocked', 'You are restricted from posting in this community.', 'error');
      return;
    }
    if (!postText.trim() || !currentUser) return;

    addCommunityPost({
      organizationId: orgId,
      authorUserId: currentUser.id,
      authorName: currentUser.name,
      authorRole: 'member',
      authorAvatar: currentUser.avatar,
      content: postText.trim(),
      imageUrl: postImage || undefined,
    });

    showToast('Post Shared', 'Published to your organization feed.', 'success');
    setIsNewPostOpen(false);
    setPostText('');
    setPostImage('');
  };

  const handleAddComment = (postId: string) => {
    if (isCommunityBanned) {
      showToast('Action Blocked', 'Your community posting privileges are suspended.', 'error');
      return;
    }

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

  const handleReport = (postId: string) => {
    reportPost(postId, 'Flagged by client for review');
    showToast('Post Reported', 'Thank you. The coach has been notified for moderation.', 'info');
  };

  return (
    <ClientAppLayout>
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Community Feed</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Private community space for {currentOrganization?.name}.
            </p>
          </div>

          {!isCommunityBanned && (
            <Button
              variant="primary"
              size="xs"
              onClick={() => setIsNewPostOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New Post
            </Button>
          )}
        </div>

        {/* BANNED COMMUNITY STATUS BANNER */}
        {isCommunityBanned && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Community Access Suspended</span>
              <p className="mt-0.5 leading-relaxed text-amber-800">
                Your community posting and commenting privileges are currently restricted by your coach. However, all your workouts, nutrition meal plans, and direct messaging remain fully active.
              </p>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="flex flex-col gap-4">
          {orgPosts.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-500 bg-white">
              No community posts yet. Be the first to share a win!
            </Card>
          ) : (
            orgPosts.map((post) => (
              <Card
                key={post.id}
                className={`bg-white border-slate-200 shadow-2xs ${post.isPinned ? 'border-teal-500/80 ring-1 ring-teal-500/30' : ''}`}
              >
                {/* Author Info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-teal-700 overflow-hidden shrink-0">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                      ) : (
                        post.authorName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900">{post.authorName}</h4>
                        <Badge variant={post.authorRole === 'owner' ? 'info' : 'default'} size="xs">
                          {post.authorRole === 'owner' ? 'Coach' : 'Member'}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {post.isPinned && (
                      <Badge variant="info" size="xs" className="flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </Badge>
                    )}
                    <button
                      onClick={() => handleReport(post.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                      title="Report Post"
                    >
                      <Flag className="w-3.5 h-3.5" />
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
                              Content archived
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
                            <Play className="w-3 h-3" /> Watch Video
                          </Button>
                        );
                      })()
                    )}
                  </div>
                )}

                {/* Content */}
                <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed mb-3">
                  {post.content}
                </p>

                {/* Image */}
                {post.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 mb-3 max-h-72">
                    <img src={post.imageUrl} alt="Post attachment" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Reactions & Comments bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mb-3">
                  <button
                    onClick={() => currentUser && toggleLikePost(post.id, currentUser.id)}
                    className="flex items-center gap-1.5 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        currentUser && post.likedByUserIds.includes(currentUser.id)
                          ? 'text-rose-500 fill-rose-50'
                          : 'text-slate-400'
                      }`}
                    />
                    <span className="font-semibold">{post.likesCount} Likes</span>
                  </button>

                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments.length} Comments</span>
                  </span>
                </div>

                {/* Single-Level Comments */}
                <div className="flex flex-col gap-2 pt-1">
                  {post.comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start gap-2"
                    >
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-teal-700 shrink-0">
                        {c.authorName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{c.authorName}</span>
                        <p className="text-slate-700 mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Comment Input */}
                  {!isCommunityBanned && (
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        placeholder="Write a comment..."
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
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Modal: Create Post */}
        <Modal
          isOpen={isNewPostOpen}
          onClose={() => setIsNewPostOpen(false)}
          title="Share with Community"
          description={`Post a win or question to the ${currentOrganization?.name} feed.`}
          maxWidth="sm"
        >
          <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
            <Textarea
              label="Post Message"
              required
              rows={3}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Hit a new PR? Made an awesome meal? Share with your team..."
            />
            <Input
              label="Image URL (Optional)"
              value={postImage}
              onChange={(e) => setPostImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />

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
      />
    </ClientAppLayout>
  );
}
