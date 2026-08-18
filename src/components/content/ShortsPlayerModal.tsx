'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  ChevronUp,
  ChevronDown,
  Heart,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { CoachContent } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';

interface ShortsPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  shorts: CoachContent[];
  initialShortId?: string;
  currentUserId?: string;
  isCoach?: boolean;
}

export const ShortsPlayerModal: React.FC<ShortsPlayerModalProps> = ({
  isOpen,
  onClose,
  shorts,
  initialShortId,
  currentUserId,
  isCoach,
}) => {
  const { toggleLikeCoachContent, toggleBookmarkCoachContent, shareContentToCommunity } = useData();
  const { showToast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (initialShortId && shorts.length > 0) {
      const idx = shorts.findIndex((s) => s.id === initialShortId);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [initialShortId, shorts]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsPlaying(true);
      setProgress(0);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const currentShort = shorts[currentIndex];

  useEffect(() => {
    if (videoRef.current && isOpen) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [currentIndex, isOpen]);

  if (!isOpen || !currentShort) return null;

  const hasLiked = currentUserId ? currentShort.likedByUserIds.includes(currentUserId) : false;
  const hasBookmarked = currentUserId ? currentShort.bookmarkedByUserIds.includes(currentUserId) : false;

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

  const handleNext = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / (videoRef.current.duration || 1)) * 100;
      setProgress(p);
    }
  };

  const handleShareToCommunity = () => {
    const res = shareContentToCommunity(currentShort.id);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const videoSrc = currentShort.mediaUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Main Vertical Short Shell */}
      <div className="relative w-full max-w-sm h-[88vh] max-h-[720px] bg-black rounded-2xl overflow-hidden shadow-2xl z-10 border border-slate-700 flex flex-col justify-between animate-in zoom-in-95 duration-150">
        {/* Video Surface */}
        <div className="absolute inset-0 z-0" onClick={togglePlay}>
          <video
            ref={videoRef}
            src={videoSrc}
            poster={currentShort.thumbnailUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => {
              if (currentIndex < shorts.length - 1) {
                handleNext();
              } else {
                setIsPlaying(false);
              }
            }}
            loop={shorts.length === 1}
            muted={isMuted}
            playsInline
            autoPlay
            className="w-full h-full object-cover cursor-pointer"
          />

          {/* Pause overlay icon */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center">
                <Play className="w-7 h-7 ml-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Top Header Bar */}
        <div className="relative z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              <span>Coach Shorts</span>
            </span>
            <Badge variant="info" size="xs">
              {currentShort.category.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
              aria-label="Mute toggle"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
              aria-label="Close short"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating Right Interaction Bar */}
        <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center gap-4">
          {/* Like */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (currentUserId) toggleLikeCoachContent(currentShort.id, currentUserId);
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                hasLiked
                  ? 'bg-rose-600/90 border-rose-500 text-white scale-105'
                  : 'bg-black/50 border-white/10 text-white group-hover:bg-black/70'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow">
              {currentShort.likesCount}
            </span>
          </button>

          {/* Bookmark */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (currentUserId) toggleBookmarkCoachContent(currentShort.id, currentUserId);
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                hasBookmarked
                  ? 'bg-amber-500/90 border-amber-400 text-white scale-105'
                  : 'bg-black/50 border-white/10 text-white group-hover:bg-black/70'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${hasBookmarked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow">
              {hasBookmarked ? 'Saved' : 'Save'}
            </span>
          </button>

          {/* Coach Share to Community Button */}
          {isCoach && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShareToCommunity();
              }}
              className="flex flex-col items-center gap-1 group cursor-pointer"
              title="Share to community feed"
            >
              <div className="w-10 h-10 rounded-full bg-teal-700/90 border border-teal-500 text-white flex items-center justify-center backdrop-blur-md group-hover:bg-teal-600 transition-all">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-teal-300 drop-shadow">Share</span>
            </button>
          )}

          {/* Vertical Navigation Pill (Prev / Next) */}
          {shorts.length > 1 && (
            <div className="flex flex-col gap-1 mt-1 bg-black/60 backdrop-blur-md rounded-full p-1 border border-white/10">
              <button
                disabled={currentIndex === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  currentIndex === 0 ? 'text-slate-600' : 'text-white hover:bg-white/20'
                }`}
                aria-label="Previous short"
              >
                <ChevronUp className="w-4 h-4" />
              </button>

              <button
                disabled={currentIndex === shorts.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  currentIndex === shorts.length - 1 ? 'text-slate-600' : 'text-white hover:bg-white/20'
                }`}
                aria-label="Next short"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Details Overlay */}
        <div className="relative z-10 p-4 pt-10 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-1.5">
          {/* Coach identity */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/20 overflow-hidden shrink-0">
              {currentShort.authorAvatar ? (
                <img src={currentShort.authorAvatar} alt={currentShort.authorName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-teal-400 text-xs">
                  {currentShort.authorName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1">
                <span>Coach {currentShort.authorName}</span>
                <CheckCircle2 className="w-3 h-3 text-teal-400" />
              </p>
            </div>
          </div>

          {/* Title & Caption */}
          <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
            {currentShort.title}
          </h3>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {currentShort.description}
          </p>

          {/* Progress bar at very bottom */}
          <div className="w-full bg-white/20 rounded-full h-1 mt-1 overflow-hidden">
            <div
              className="bg-teal-400 h-full rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
