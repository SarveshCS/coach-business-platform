'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatTime, formatDate } from '@/utils/formatters';
import { checkScheduleConflict } from '@/utils/conflictDetector';
import {
  Users,
  Video,
  MapPin,
  ArrowLeft,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Edit,
} from 'lucide-react';

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const { currentOrganization } = useTenant();
  const {
    classSessions,
    classParticipants,
    users,
    markAttendance,
    cancelClassSession,
    updateClassSession,
  } = useData();
  const { showToast } = useToast();

  const session = classSessions.find((s) => s.id === sessionId);

  // Participants for this session
  const participants = classParticipants.filter((p) => p.sessionId === sessionId);

  // Modals
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Instructor illness / floor maintenance');

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(session?.date || '');
  const [rescheduleStartTime, setRescheduleStartTime] = useState(session?.startTime || '09:00');
  const [rescheduleEndTime, setRescheduleEndTime] = useState(session?.endTime || '10:00');
  const [rescheduleConflictError, setRescheduleConflictError] = useState<string | null>(null);

  if (!session) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">Class session not found.</p>
          <Link href="/dashboard/schedule">
            <Button variant="primary" size="sm" className="mt-4">
              Return to Schedule
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isCancelled = session.status === 'cancelled';
  const isFull = session.bookedCount >= session.capacity;

  const presentCount = participants.filter((p) => p.attendanceStatus === 'present').length;
  const lateCount = participants.filter((p) => p.attendanceStatus === 'late').length;
  const absentCount = participants.filter((p) => p.attendanceStatus === 'absent').length;

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/app/schedule?shareClass=${session.id}&org=${currentOrganization?.slug}`;
    navigator.clipboard?.writeText(shareUrl);
    showToast('Class Link Copied', 'Organization-aware booking share link copied to clipboard.', 'info');
  };

  const handleCancelSession = () => {
    cancelClassSession(session.id, cancelReason);
    showToast('Class Cancelled', `Session marked as cancelled and ${participants.length} attendees notified.`, 'warning');
    setIsCancelModalOpen(false);
  };

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    setRescheduleConflictError(null);

    const conflict = checkScheduleConflict(classSessions, {
      sessionId: session.id,
      coachId: session.coachId,
      date: rescheduleDate,
      startTime: rescheduleStartTime,
      endTime: rescheduleEndTime,
    });

    if (conflict.hasConflict) {
      setRescheduleConflictError(conflict.message || 'Conflict detected.');
      return;
    }

    updateClassSession(session.id, {
      date: rescheduleDate,
      startTime: rescheduleStartTime,
      endTime: rescheduleEndTime,
    });

    showToast('Class Rescheduled', `Session moved to ${rescheduleDate} (${rescheduleStartTime} - ${rescheduleEndTime}).`, 'success');
    setIsRescheduleModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/schedule">
              <Button variant="outline" size="xs" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Calendar
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {session.title}
                </h1>
                <Badge
                  variant={isCancelled ? 'danger' : isFull ? 'warning' : 'active'}
                  size="xs"
                >
                  {isCancelled ? 'Cancelled' : isFull ? 'Full Capacity' : 'Scheduled'}
                </Badge>
                {session.isOnline && <Badge variant="info" size="xs">Live Stream</Badge>}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatDate(session.date)} • {formatTime(session.startTime)} – {formatTime(session.endTime)} • Coach {session.coachName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareLink}
              leftIcon={<Share2 className="w-4 h-4" />}
            >
              Share Class
            </Button>
            {!isCancelled && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsRescheduleModalOpen(true)}
                  leftIcon={<Edit className="w-4 h-4" />}
                >
                  Reschedule
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsCancelModalOpen(true)}
                >
                  Cancel Session
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Cancellation Notice Banner if applicable */}
        {isCancelled && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold block">This session has been cancelled</span>
              <p className="mt-0.5">Reason: {session.cancellationReason || 'Instructor scheduling change.'}</p>
            </div>
          </div>
        )}

        {/* Top 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Booked Attendees"
            value={`${session.bookedCount} / ${session.capacity}`}
            icon={<Users className="w-5 h-5 text-teal-700" />}
            subtitle={`${session.capacity - session.bookedCount} spots remaining`}
          />
          <StatCard
            title="Attendance Checked"
            value={`${presentCount + lateCount} / ${participants.length}`}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-700" />}
            subtitle={`${presentCount} present • ${lateCount} late • ${absentCount} absent`}
          />
          <StatCard
            title="Meeting Details"
            value={session.isOnline ? 'Online' : 'In-Studio'}
            icon={session.isOnline ? <Video className="w-5 h-5 text-indigo-700" /> : <MapPin className="w-5 h-5 text-amber-700" />}
            subtitle={session.location || session.meetingLink}
          />
        </div>

        {/* Participant Attendance Table */}
        <Card className="p-0 overflow-hidden bg-white shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Registered Participants & Attendance
              </h3>
              <p className="text-xs text-slate-500">Click to mark Present, Late, or Absent</p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-700">
              {participants.length} Registered
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Member Name</th>
                  <th className="py-3.5 px-4">Booking Time</th>
                  <th className="py-3.5 px-4">Attendance Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No participants registered for this session yet.
                    </td>
                  </tr>
                ) : (
                  participants.map((part) => {
                    const user = users.find((u) => u.id === part.userId);
                    return (
                      <tr key={part.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-teal-700">
                              {user?.name.charAt(0) || 'M'}
                            </div>
                            <span>{user?.name || 'Client'}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                          {formatDate(part.bookedAt)}
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              part.attendanceStatus === 'present'
                                ? 'active'
                                : part.attendanceStatus === 'late'
                                ? 'warning'
                                : part.attendanceStatus === 'absent'
                                ? 'danger'
                                : 'default'
                            }
                            size="xs"
                          >
                            {part.attendanceStatus}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              variant={part.attendanceStatus === 'present' ? 'primary' : 'outline'}
                              size="xs"
                              onClick={() => markAttendance(part.id, 'present')}
                            >
                              Present
                            </Button>
                            <Button
                              variant={part.attendanceStatus === 'late' ? 'secondary' : 'outline'}
                              size="xs"
                              onClick={() => markAttendance(part.id, 'late')}
                            >
                              Late
                            </Button>
                            <Button
                              variant={part.attendanceStatus === 'absent' ? 'danger' : 'outline'}
                              size="xs"
                              onClick={() => markAttendance(part.id, 'absent')}
                            >
                              Absent
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Reschedule Modal */}
        <Modal
          isOpen={isRescheduleModalOpen}
          onClose={() => setIsRescheduleModalOpen(false)}
          title="Reschedule Class Session"
          description="Update the date and time. Validates coach schedule conflicts automatically."
          maxWidth="sm"
        >
          <form onSubmit={handleReschedule} className="flex flex-col gap-4">
            {rescheduleConflictError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {rescheduleConflictError}
              </div>
            )}

            <Input
              label="New Date"
              type="date"
              required
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Time"
                type="time"
                required
                value={rescheduleStartTime}
                onChange={(e) => setRescheduleStartTime(e.target.value)}
              />
              <Input
                label="End Time"
                type="time"
                required
                value={rescheduleEndTime}
                onChange={(e) => setRescheduleEndTime(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsRescheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Confirm Reschedule
              </Button>
            </div>
          </form>
        </Modal>

        {/* Cancel Confirmation Modal */}
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title="Cancel Class Session"
          description="Are you sure you want to cancel this scheduled class? All registered participants will receive an instant notification."
          maxWidth="sm"
        >
          <div className="flex flex-col gap-4">
            <Input
              label="Cancellation Reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Scheduled gym maintenance"
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" onClick={() => setIsCancelModalOpen(false)}>
                Keep Session
              </Button>
              <Button variant="danger" size="sm" onClick={handleCancelSession}>
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
