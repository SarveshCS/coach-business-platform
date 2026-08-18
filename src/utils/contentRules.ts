import { CoachContent, OrganizationStorage } from '@/types';

/**
 * Format raw byte count into human-readable string (e.g., "450 MB", "18.4 GB")
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format duration in seconds into MM:SS or HH:MM:SS
 */
export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Compute aggregate storage metrics and breakdown for an organization
 */
export function calculateStorageUsage(
  contents: CoachContent[],
  limitBytes: number = 50 * 1024 * 1024 * 1024 // 50 GB default limit
): OrganizationStorage {
  let videosBytes = 0;
  let shortsBytes = 0;
  let imagesBytes = 0;
  let otherBytes = 0;

  for (const c of contents) {
    if (c.status === 'archived') continue; // Archived items can optionally be retained or excluded; active storage counts
    const size = c.storageSizeBytes || 0;
    if (c.type === 'video') {
      videosBytes += size;
    } else if (c.type === 'short') {
      shortsBytes += size;
    } else if (c.type === 'image') {
      imagesBytes += size;
    } else {
      otherBytes += size;
    }
  }

  const usedBytes = videosBytes + shortsBytes + imagesBytes + otherBytes;

  return {
    usedBytes,
    limitBytes,
    breakdown: {
      videosBytes,
      shortsBytes,
      imagesBytes,
      otherBytes,
    },
  };
}

/**
 * Check if the organization has available storage capacity for a new file
 */
export function hasStorageCapacity(
  currentUsedBytes: number,
  newFileSizeBytes: number,
  limitBytes: number
): { canUpload: boolean; remainingBytes: number; message?: string } {
  const remainingBytes = Math.max(0, limitBytes - currentUsedBytes);
  if (currentUsedBytes + newFileSizeBytes > limitBytes) {
    return {
      canUpload: false,
      remainingBytes,
      message: `Storage quota exceeded. This upload (${formatBytes(newFileSizeBytes)}) exceeds your remaining storage (${formatBytes(remainingBytes)} of ${formatBytes(limitBytes)}). Please delete older media or upgrade your subscription tier.`,
    };
  }
  return {
    canUpload: true,
    remainingBytes: remainingBytes - newFileSizeBytes,
  };
}

/**
 * Validation for Coach Content sharing to community
 */
export function canShareToCommunity(content: CoachContent): { canShare: boolean; reason?: string } {
  if (content.status !== 'published') {
    return { canShare: false, reason: 'Only published coach content can be shared to the community feed.' };
  }
  if (content.visibility === 'coach_only') {
    return { canShare: false, reason: 'Content with "Coach Only" visibility cannot be shared to public members.' };
  }
  return { canShare: true };
}
