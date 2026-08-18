import { ClassSession } from '@/types';

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingSession?: ClassSession;
  message?: string;
}

// Convert "HH:MM" string to minutes from midnight
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Checks if a proposed session schedule overlaps with an existing session for the SAME coach on the SAME date.
 * Different coaches CAN have overlapping sessions.
 */
export function checkScheduleConflict(
  existingSessions: ClassSession[],
  candidate: {
    sessionId?: string; // Ignore if updating the current session
    coachId: string;
    date: string;
    startTime: string;
    endTime: string;
  }
): ConflictCheckResult {
  const candidateStart = timeToMinutes(candidate.startTime);
  const candidateEnd = timeToMinutes(candidate.endTime);

  if (candidateEnd <= candidateStart) {
    return {
      hasConflict: true,
      message: 'End time must be later than start time.',
    };
  }

  for (const session of existingSessions) {
    // Skip if it's the exact same session being edited
    if (candidate.sessionId && session.id === candidate.sessionId) {
      continue;
    }

    // Skip cancelled sessions
    if (session.status === 'cancelled') {
      continue;
    }

    // Check if same coach and same date
    if (session.coachId === candidate.coachId && session.date === candidate.date) {
      const sessionStart = timeToMinutes(session.startTime);
      const sessionEnd = timeToMinutes(session.endTime);

      // Overlap occurs if candidateStart < sessionEnd AND candidateEnd > sessionStart
      const overlaps = candidateStart < sessionEnd && candidateEnd > sessionStart;

      if (overlaps) {
        return {
          hasConflict: true,
          conflictingSession: session,
          message: `Schedule conflict: Coach is already assigned to "${session.title}" on ${session.date} from ${session.startTime} to ${session.endTime}.`,
        };
      }
    }
  }

  return { hasConflict: false };
}
