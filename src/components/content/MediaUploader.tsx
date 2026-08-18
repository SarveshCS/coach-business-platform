'use client';

import React, { useState } from 'react';
import { Upload, Film, Image as ImageIcon, CheckCircle2, AlertCircle, X, RefreshCw, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatBytes, formatDuration, hasStorageCapacity } from '@/utils/contentRules';
import { CoachContentType } from '@/types';

export interface MediaUploadResult {
  mediaUrl: string;
  thumbnailUrl: string;
  durationSeconds?: number;
  storageSizeBytes: number;
  fileName: string;
}

interface MediaUploaderProps {
  contentType: CoachContentType;
  currentUsedBytes: number;
  storageLimitBytes: number;
  initialMedia?: MediaUploadResult | null;
  onMediaReady: (media: MediaUploadResult | null) => void;
}

type UploadState = 'idle' | 'uploading' | 'processing' | 'ready' | 'failed';

const PRESET_DEMO_MEDIA: Record<
  string,
  { name: string; type: CoachContentType; mediaUrl: string; thumbnailUrl: string; duration: number; sizeBytes: number }[]
> = {
  video: [
    {
      name: 'Deadlift Biomechanics Masterclass (MP4)',
      type: 'video',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      duration: 765,
      sizeBytes: 471859200, // 450 MB
    },
    {
      name: 'High-Protein Meal Prep Batch (MP4)',
      type: 'video',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      duration: 510,
      sizeBytes: 293601280, // 280 MB
    },
  ],
  short: [
    {
      name: 'Shoulder Position Form Check (Short)',
      type: 'short',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
      duration: 45,
      sizeBytes: 36700160, // 35 MB
    },
    {
      name: 'Glute Activation 3-Step Drill (Short)',
      type: 'short',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
      duration: 48,
      sizeBytes: 37748736, // 36 MB
    },
  ],
  image: [
    {
      name: 'Client 12-Week Transformation (JPEG)',
      type: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
      duration: 0,
      sizeBytes: 8388608, // 8 MB
    },
  ],
  achievement: [
    {
      name: 'Competition Medal Podium (JPEG)',
      type: 'achievement',
      mediaUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
      duration: 0,
      sizeBytes: 15728640, // 15 MB
    },
  ],
};

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  contentType,
  currentUsedBytes,
  storageLimitBytes,
  initialMedia,
  onMediaReady,
}) => {
  const [uploadState, setUploadState] = useState<UploadState>(initialMedia ? 'ready' : 'idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mediaResult, setMediaResult] = useState<MediaUploadResult | null>(initialMedia || null);

  const isVideo = contentType === 'video' || contentType === 'short';

  const startSimulatedUpload = (preset: {
    name: string;
    mediaUrl: string;
    thumbnailUrl: string;
    duration: number;
    sizeBytes: number;
  }) => {
    // 1. Quota check
    const quotaCheck = hasStorageCapacity(currentUsedBytes, preset.sizeBytes, storageLimitBytes);
    if (!quotaCheck.canUpload) {
      setUploadState('failed');
      setErrorMessage(quotaCheck.message || 'Storage quota exceeded.');
      return;
    }

    setErrorMessage(null);
    setUploadState('uploading');
    setProgress(15);

    // Staged progress
    const t1 = setTimeout(() => setProgress(45), 300);
    const t2 = setTimeout(() => setProgress(85), 700);
    const t3 = setTimeout(() => {
      setProgress(100);
      setUploadState('processing');
    }, 1100);

    const t4 = setTimeout(() => {
      const result: MediaUploadResult = {
        mediaUrl: preset.mediaUrl,
        thumbnailUrl: preset.thumbnailUrl,
        durationSeconds: preset.duration,
        storageSizeBytes: preset.sizeBytes,
        fileName: preset.name,
      };
      setMediaResult(result);
      setUploadState('ready');
      onMediaReady(result);
    }, 1700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  };

  const handleRemove = () => {
    setUploadState('idle');
    setProgress(0);
    setMediaResult(null);
    setErrorMessage(null);
    onMediaReady(null);
  };

  const relevantPresets = PRESET_DEMO_MEDIA[contentType] || PRESET_DEMO_MEDIA.video;

  return (
    <div className="flex flex-col gap-3">
      {/* Ready Preview State */}
      {uploadState === 'ready' && mediaResult && (
        <div className="relative rounded-xl border border-slate-200 bg-slate-50 overflow-hidden p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative w-20 h-20 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                <img
                  src={mediaResult.thumbnailUrl}
                  alt={mediaResult.fileName}
                  className="w-full h-full object-cover"
                />
                {isVideo && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-sm">
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {formatBytes(mediaResult.storageSizeBytes)}
                  </span>
                  {mediaResult.durationSeconds ? (
                    <span className="text-xs text-slate-500 font-mono">
                      • {formatDuration(mediaResult.durationSeconds)}
                    </span>
                  ) : null}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-sm">{mediaResult.fileName}</h4>
                <p className="text-xs text-slate-500">
                  Simulated cloud storage encoded • Ready to attach
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleRemove}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-300 shrink-0"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Remove
            </Button>
          </div>
        </div>
      )}

      {/* Uploading / Processing State */}
      {(uploadState === 'uploading' || uploadState === 'processing') && (
        <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-6 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              {uploadState === 'uploading' ? `Uploading Media (${progress}%)...` : 'Generating Video Thumbnails & Optimizing...'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulating fast client-side upload and storage validation
            </p>
          </div>

          <div className="w-full max-w-xs bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-700 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Failed / Error State */}
      {uploadState === 'failed' && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex flex-col gap-2.5">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-900">Upload Blocked</h4>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" size="xs" onClick={() => setUploadState('idle')}>
              Dismiss & Try Smaller File
            </Button>
          </div>
        </div>
      )}

      {/* Idle Drag & Drop / Presets Selector */}
      {uploadState === 'idle' && (
        <div className="flex flex-col gap-3">
          <div className="border border-dashed border-slate-300 hover:border-teal-600 rounded-xl p-6 bg-white flex flex-col items-center justify-center text-center transition-colors">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mb-2.5">
              {isVideo ? <Film className="w-5 h-5 text-teal-700" /> : <ImageIcon className="w-5 h-5 text-teal-700" />}
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              {isVideo ? 'Upload Coaching Video or Short' : 'Upload Coaching Image / Asset'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
              Supports MP4, MOV, WEBM, PNG, JPG up to 1GB. Simulated storage checks remaining organization quota.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-slate-400 font-semibold mr-1">1-Click Test Presets:</span>
              {relevantPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => startSimulatedUpload(preset)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-3 h-3 text-teal-700" />
                  <span>{preset.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({formatBytes(preset.sizeBytes)})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
