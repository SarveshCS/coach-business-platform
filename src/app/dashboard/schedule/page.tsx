'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { checkScheduleConflict } from '@/utils/conflictDetector';
import { formatTime, formatDate } from '@/utils/formatters';
import {
  Calendar,
  Clock,
  Plus,
  AlertTriangle,
  Video,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function CoachSchedulePage() {
  const router = useRouter();
  const { currentOrganization } = useTenant();
  const { classSessions, classTypes, coachAccounts, addClassSession } = useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';
  const orgSessions = classSessions.filter((s) => s.organizationId === orgId);
  const orgClassTypes = classTypes.filter((t) => t.organizationId === orgId);

  const [calendarView, setCalendarView] = useState<'week' | 'day' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Add Session Modal Form
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [classTypeId, setClassTypeId] = useState(orgClassTypes[0]?.id || 'ctype_hiit');
  const [sessionTitle, setSessionTitle] = useState('');
  const [coachId, setCoachId] = useState(coachAccounts[0]?.id || 'usr_coach_1');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [capacity, setCapacity] = useState(15);
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState('Main Gym Floor — Turf Zone');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/xyz-fitness-live');
  const [isRecurring, setIsRecurring] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Generate 7 days for week view
  const weekDays = useMemo(() => {
    const start = new Date(selectedDate);
    const dayOfWeek = start.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(start.getDate() + mondayOffset);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
      });
    }
    return days;
  }, [selectedDate]);

  const handlePrev = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - (calendarView === 'week' ? 7 : 1));
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + (calendarView === 'week' ? 7 : 1));
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    const targetClassType = orgClassTypes.find((t) => t.id === classTypeId);
    const targetCoach = coachAccounts.find((c) => c.id === coachId || c.userId === coachId);
    const finalTitle = sessionTitle || targetClassType?.name || 'Class Session';

    // 1. Check Scheduling Conflict
    const conflictResult = checkScheduleConflict(orgSessions, {
      coachId,
      date: sessionDate,
      startTime,
      endTime,
    });

    if (conflictResult.hasConflict) {
      setConflictError(conflictResult.message || 'Schedule conflict detected.');
      showToast('Scheduling Conflict', conflictResult.message, 'error');
      return;
    }

    // 2. Add Session
    addClassSession({
      organizationId: orgId,
      classTypeId,
      title: finalTitle,
      coachId,
      coachName: targetCoach?.name || 'Rahul Sharma',
      date: sessionDate,
      startTime,
      endTime,
      durationMinutes: 60,
      capacity,
      isOnline,
      location: isOnline ? undefined : location,
      meetingLink: isOnline ? meetingLink : undefined,
      status: 'scheduled',
      recurringSeriesId: isRecurring ? `series_${Date.now()}` : undefined,
    });

    showToast(
      'Session Scheduled',
      `"${finalTitle}" on ${sessionDate} (${startTime} - ${endTime}) added to calendar.`,
      'success'
    );

    setIsAddSessionOpen(false);
    setSessionTitle('');
    setConflictError(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Class Calendar & Scheduling
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live in-person & online class schedule with coach conflict prevention.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setConflictError(null);
                setIsAddSessionOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Schedule Session
            </Button>
          </div>
        </div>

        {/* Calendar Nav & View Tabs */}
        <Card className="p-3.5 bg-white shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-xs sm:text-sm font-bold text-slate-900 min-w-[160px] text-center">
              {calendarView === 'week'
                ? `Week of ${formatDate(weekDays[0].dateStr)}`
                : formatDate(selectedDate)}
            </div>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            >
              Today
            </Button>
          </div>

          <div className="inline-flex p-1 bg-slate-100 border border-slate-200 rounded-lg gap-1">
            {(['week', 'day', 'month'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setCalendarView(view)}
                className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors cursor-pointer ${
                  calendarView === view ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {view} View
              </button>
            ))}
          </div>
        </Card>

        {/* WEEK VIEW (Default) */}
        {calendarView === 'week' && (
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const daySessions = orgSessions.filter((s) => s.date === day.dateStr);
              const isToday = day.dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={day.dateStr}
                  className={`flex flex-col min-h-[380px] rounded-xl border p-3 transition-all ${
                    isToday
                      ? 'bg-teal-50/40 border-teal-600 shadow-xs'
                      : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
                    <span className="text-xs font-bold uppercase text-slate-500">{day.dayName}</span>
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                        isToday ? 'bg-teal-700 text-white' : 'text-slate-900'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                    {daySessions.length === 0 ? (
                      <span className="text-[11px] text-slate-400 my-auto text-center block">
                        No sessions
                      </span>
                    ) : (
                      daySessions.map((session) => {
                        const isCancelled = session.status === 'cancelled';
                        const isFull = session.bookedCount >= session.capacity;

                        return (
                          <Link
                            key={session.id}
                            href={`/dashboard/classes/${session.id}`}
                            className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all hover:scale-[1.02] ${
                              isCancelled
                                ? 'bg-slate-50 border-slate-200 opacity-60'
                                : 'bg-white border-slate-200 hover:border-teal-600 shadow-2xs'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-[10px] font-bold text-teal-700 font-mono">
                                  {formatTime(session.startTime)}
                                </span>
                                {session.isOnline ? (
                                  <Video className="w-3 h-3 text-indigo-600" />
                                ) : (
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                )}
                              </div>
                              <h4
                                className={`text-xs font-bold truncate ${
                                  isCancelled ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}
                              >
                                {session.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                                Coach {session.coachName}
                              </p>
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                              <span
                                className={`font-semibold ${
                                  isFull ? 'text-rose-600' : 'text-slate-600'
                                }`}
                              >
                                {session.bookedCount}/{session.capacity} spots
                              </span>
                              {isCancelled && (
                                <span className="text-rose-600 font-bold">Cancelled</span>
                              )}
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DAY VIEW & MONTH VIEW placeholders */}
        {calendarView !== 'week' && (
          <Card className="p-8 text-center bg-white">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Viewing {calendarView.toUpperCase()} Calendar for {formatDate(selectedDate)}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Switch to Week view for full schedule management.
            </p>
            <Button variant="primary" size="sm" onClick={() => setCalendarView('week')}>
              Return to Week View
            </Button>
          </Card>
        )}

        {/* Modal: Schedule Class Session */}
        <Modal
          isOpen={isAddSessionOpen}
          onClose={() => setIsAddSessionOpen(false)}
          title="Schedule New Class Session"
          description="Create an in-studio or virtual live class. Real-time conflict validation will ensure no double bookings."
          maxWidth="md"
        >
          <form onSubmit={handleCreateSession} className="flex flex-col gap-4">
            {/* Conflict Alert Banner if triggered */}
            {conflictError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Scheduling Conflict Detected</span>
                  <p className="mt-0.5 leading-relaxed">{conflictError}</p>
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                    Please choose a different time slot or assign an alternate coach.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Class Type"
                value={classTypeId}
                onChange={(e) => {
                  setClassTypeId(e.target.value);
                  const t = orgClassTypes.find((ct) => ct.id === e.target.value);
                  if (t) setIsOnline(t.isOnline);
                }}
              >
                {orgClassTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </Select>

              <Input
                label="Custom Session Title (Optional)"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="e.g. HIIT Power Burn"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Assigned Coach"
                value={coachId}
                onChange={(e) => setCoachId(e.target.value)}
              >
                {coachAccounts.map((c) => (
                  <option key={c.id} value={c.userId || c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>

              <Input
                label="Date"
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Start Time"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <Input
                label="End Time"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
              <Input
                label="Capacity"
                type="number"
                min="1"
                max="100"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOnline}
                  onChange={(e) => setIsOnline(e.target.checked)}
                  className="rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                />
                <span>Virtual Online Session</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                />
                <span>Recurring Series (Mon/Wed/Fri)</span>
              </label>
            </div>

            {isOnline ? (
              <Input
                label="Google Meet / Zoom Stream URL"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
              />
            ) : (
              <Input
                label="Studio Location / Room"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Main Studio Floor A"
              />
            )}

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddSessionOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Validate & Save Session
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
