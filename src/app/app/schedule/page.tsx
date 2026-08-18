'use client';

import React from 'react';
import { ClientAppLayout } from '@/components/layout/ClientAppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatTime, formatDate } from '@/utils/formatters';
import { Clock, Video, MapPin, CheckCircle2 } from 'lucide-react';

export default function ClientSchedulePage() {
  const { currentUser } = useAuth();
  const { currentOrganization, currentMembership } = useTenant();
  const { classSessions, classParticipants, bookClassSession, cancelClassBooking } = useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';
  const memId = currentMembership?.id;

  const orgSessions = classSessions.filter((s) => s.organizationId === orgId);

  const handleBook = (sessionId: string) => {
    if (!memId || !currentUser) return;
    const res = bookClassSession(sessionId, memId, currentUser.id);
    if (res.success) {
      showToast('Class Booked!', res.message, 'success');
    } else {
      showToast('Booking Failed', res.message, 'error');
    }
  };

  const handleCancel = (sessionId: string) => {
    if (!memId) return;
    cancelClassBooking(sessionId, memId);
    showToast('Booking Cancelled', 'Your spot was released back to the class.', 'info');
  };

  return (
    <ClientAppLayout>
      <div className="flex flex-col gap-5 pb-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Class Schedule & Booking</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Book in-person sessions or access live virtual streams.
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          {orgSessions.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-500 bg-white">
              No classes currently scheduled in this organization.
            </Card>
          ) : (
            orgSessions.map((session) => {
              const isBooked = classParticipants.some(
                (p) => p.sessionId === session.id && p.membershipId === memId && p.status === 'booked'
              );
              const isFull = session.bookedCount >= session.capacity;
              const isCancelled = session.status === 'cancelled';

              return (
                <Card
                  key={session.id}
                  className={`flex flex-col justify-between transition-all bg-white shadow-2xs ${
                    isBooked
                      ? 'border-teal-300 bg-teal-50/40 ring-1 ring-teal-300/50'
                      : isCancelled
                      ? 'opacity-60 bg-slate-50'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={session.isOnline ? 'info' : 'default'} size="xs">
                          {session.isOnline ? 'Virtual Stream' : 'In-Studio'}
                        </Badge>
                        {isBooked && (
                          <Badge variant="success" size="xs">
                            <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Booked
                          </Badge>
                        )}
                        {isCancelled && (
                          <Badge variant="danger" size="xs">
                            Cancelled
                          </Badge>
                        )}
                      </div>

                      <span className="text-xs font-mono font-semibold text-slate-700">
                        {formatDate(session.date)}
                      </span>
                    </div>

                    <h3 className={`text-base font-bold text-slate-900 ${isCancelled ? 'line-through text-slate-400' : ''}`}>
                      {session.title}
                    </h3>

                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono text-teal-700 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(session.startTime)} – {formatTime(session.endTime)}
                      </span>
                      <span>Coach {session.coachName}</span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      {session.isOnline ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-indigo-700 font-medium">Online Google Meet Stream</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          <span>{session.location || 'Main Gym Floor'}</span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        isFull ? 'text-rose-600' : 'text-slate-500'
                      }`}
                    >
                      {session.bookedCount} / {session.capacity} spots filled
                    </span>

                    {isCancelled ? (
                      <span className="text-xs text-rose-600 font-semibold">Cancelled</span>
                    ) : isBooked ? (
                      <div className="flex items-center gap-2">
                        {session.isOnline && session.meetingLink && (
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" /> Join Live
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleCancel(session.id)}
                          className="text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          Cancel Spot
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="xs"
                        disabled={isFull}
                        onClick={() => handleBook(session.id)}
                      >
                        {isFull ? 'Class Full' : 'Book Spot'}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </ClientAppLayout>
  );
}
