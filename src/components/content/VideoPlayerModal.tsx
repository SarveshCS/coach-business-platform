'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Bookmark,
  Share2,
  Eye,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { CoachContent } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDuration, formatBytes } from '@/utils/contentRules';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: CoachContent | null;
  currentUserId?: string;
  isCoach?: boolean;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  content,
  currentUserId,
  isCoach,
}) => {
  const { toggleLikeCoachContent, toggleBookmarkCoachContent, shareContentToCommunity } = useData();
  const { showToast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsPlaying(false);
      setCurrentTime(0);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !content) return null;

  const hasLiked = currentUserId ? content.likedByUserIds.includes(currentUserId) : false;
  const hasBookmarked = currentUserId ? content.bookmarkedByUserIds.includes(currentUserId) : false;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || content.durationSeconds || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleShareToCommunity = () => {
    const res = shareContentToCommunity(content.id);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const videoSrc = content.mediaUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 my-4 flex flex-col animate-in zoom-in-95 duration-150 max-h-[95vh]">
        {/* Video Player Box */}
        <div className="relative w-full bg-slate-950 aspect-video flex items-center justify-center overflow-hidden group">
          <video
            ref={videoRef}
            src={videoSrc}
            poster={content.thumbnailUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            muted={isMuted}
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
          />

          {/* Big Play Button Overlay when paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-teal-700/90 hover:bg-teal-700 text-white flex items-center justify-center shadow-xl transition-all transform hover:scale-105 cursor-pointer"
              aria-label="Play video"
            >
              <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1" />
            </button>
          )}

          {/* Video Control Bar */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Scrubber */}
            <input
              type="range"
              min="0"
              max={duration || content.durationSeconds || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />

            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="p-1 hover:text-teal-400 transition-colors cursor-pointer">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                <button onClick={() => setIsMuted(!isMuted)} className="p-1 hover:text-teal-400 transition-colors cursor-pointer">
                  {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <span className="font-mono text-[11px] text-slate-300">
                  {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration || content.durationSeconds || 0))}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase font-mono px-2 py-0.5 bg-slate-800/80 rounded">
                  HD 1080p
                </span>
              </div>
            </div>
          </div>

          {/* Top Floating Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-colors cursor-pointer"
            aria-label="Close player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Details & Interaction Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-4 text-slate-900">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="info" size="xs">
                {content.category.toUpperCase()}
              </Badge>
              <Badge variant={content.type === 'video' ? 'info' : 'active'} size="xs">
                {content.type.toUpperCase()}
              </Badge>
              {content.featured && (
                <Badge variant="warning" size="xs">
                  Featured
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {content.viewsCount} views
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                {formatBytes(content.storageSizeBytes)}
              </span>
            </div>
          </div>

          {/* Title & Author */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{content.title}</h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                {content.authorAvatar ? (
                  <img src={content.authorAvatar} alt={content.authorName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-teal-700 text-xs">
                    {content.authorName.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Coach {content.authorName}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                </p>
                <p className="text-[10px] text-slate-500">
                  Published {content.publishedAt ? new Date(content.publishedAt).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {content.description}
            </p>

            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-200">
                {content.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md"
                  >
                    <Tag className="w-2.5 h-2.5 text-slate-400" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Row: Like, Bookmark, Share */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={hasLiked ? 'primary' : 'outline'}
                size="sm"
                onClick={() => currentUserId && toggleLikeCoachContent(content.id, currentUserId)}
                className={`transition-all ${hasLiked ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}`}
              >
                <Heart className={`w-4 h-4 mr-1.5 ${hasLiked ? 'fill-white' : ''}`} />
                <span>{content.likesCount}</span>
              </Button>

              <Button
                type="button"
                variant={hasBookmarked ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => currentUserId && toggleBookmarkCoachContent(content.id, currentUserId)}
                className={`transition-all ${hasBookmarked ? 'text-amber-700 border-amber-300 bg-amber-50' : ''}`}
              >
                <Bookmark className={`w-4 h-4 mr-1.5 ${hasBookmarked ? 'fill-amber-600' : ''}`} />
                <span>{hasBookmarked ? 'Saved' : 'Save'}</span>
              </Button>
            </div>

            {/* Coach Share to Community Button */}
            {isCoach && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleShareToCommunity}
              >
                <Share2 className="w-4 h-4 mr-1.5 text-teal-700" />
                <span>{content.communityShared ? 'Shared in Feed' : 'Share to Community'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
