'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LineChart } from '@/components/ui/SvgChart';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatTime } from '@/utils/formatters';
import {
  Users,
  Calendar,
  Brain,
  DollarSign,
  MessageSquare,
  AlertCircle,
  Plus,
  ArrowRight,
  Coins,
  Clock,
  Video,
  Film,
} from 'lucide-react';
import { formatBytes } from '@/utils/contentRules';

export default function CoachDashboardPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { currentOrganization } = useTenant();
  const {
    memberships,
    classSessions,
    coachingSubscriptions,
    messages,
    payments,
    coachAccounts,
    activityLogs,
    createUserAndMembership,
    allocateCreditsToMember,
    coachContents,
    getOrganizationStorage,
  } = useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';
  const orgContents = coachContents.filter((c) => c.organizationId === orgId);
  const orgStorage = getOrganizationStorage(orgId);

  // Org scoped data
  const orgMembers = memberships.filter((m) => m.organizationId === orgId);
  const activeMembers = orgMembers.filter((m) => m.status === 'active');
  const orgSessions = classSessions.filter((s) => s.organizationId === orgId && s.status !== 'cancelled');

  // Today's classes
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = orgSessions.filter((s) => s.date === todayStr);

  // Expiring renewals
  const expiringSubs = coachingSubscriptions.filter(
    (s) => s.organizationId === orgId && s.status === 'expiring_soon'
  );

  // Unread messages
  const unreadMessages = messages.filter(
    (m) => m.organizationId === orgId && m.receiverUserId === currentUser?.id && !m.isRead
  );

  // Revenue
  const totalRevenue = payments
    .filter((p) => p.organizationId === orgId && p.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Coach AI balance
  const activeCoach = coachAccounts.find((c) => c.userId === currentUser?.id) || coachAccounts[0];

  // Quick Action Modals
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');

  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(orgMembers[0]?.id || '');
  const [allocateAmount, setAllocateAmount] = useState('250');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;

    const result = createUserAndMembership({
      name: newMemberName,
      email: newMemberEmail,
      phone: newMemberPhone,
      organizationId: orgId,
      role: 'member',
    });

    showToast(
      result.isNewUser ? 'New Member Created' : 'Existing User Enrolled',
      `${result.user.name} was added to ${currentOrganization?.name || 'organization'}.`,
      'success'
    );
    setIsAddMemberOpen(false);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberPhone('');
  };

  const handleAllocateCredits = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(allocateAmount, 10);
    if (!activeCoach || !selectedMemberId || isNaN(amount) || amount <= 0) return;

    const res = allocateCreditsToMember(activeCoach.id, selectedMemberId, amount, orgId);
    if (res.success) {
      showToast('AI Credits Allocated', res.message, 'success');
      setIsAllocateOpen(false);
    } else {
      showToast('Allocation Failed', res.message, 'error');
    }
  };

  // Mock revenue trend
  const revenueTrend = [
    { label: 'W1', value: 850 },
    { label: 'W2', value: 1120 },
    { label: 'W3', value: 1340 },
    { label: 'W4', value: 1690 },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Welcome & Quick Actions Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-teal-700 text-white text-[10px] font-bold flex items-center justify-center">
                {currentOrganization?.name.slice(0, 2).toUpperCase() || 'CO'}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                {currentOrganization?.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Welcome back, {currentUser?.name || 'Coach'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Here is what is happening across your coaching business today.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddMemberOpen(true)}
            >
              Add Member
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Coins className="w-4 h-4 text-amber-600" />}
              onClick={() => setIsAllocateOpen(true)}
            >
              Allocate AI Credits
            </Button>
            <Link href="/dashboard/schedule">
              <Button variant="outline" size="sm" leftIcon={<Calendar className="w-4 h-4" />}>
                Schedule Class
              </Button>
            </Link>
            <Link href="/dashboard/ai">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Brain className="w-4 h-4 text-teal-700" />}
              >
                AI Studio
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Clients"
            value={activeMembers.length}
            icon={<Users className="w-5 h-5 text-teal-700" />}
            trend={{ value: '+4 this month', isPositive: true }}
            subtitle={`${orgMembers.length} total enrolled`}
          />

          <StatCard
            title="Today's Sessions"
            value={todaySessions.length}
            icon={<Calendar className="w-5 h-5 text-emerald-700" />}
            subtitle={`${todaySessions.reduce((acc, s) => acc + s.bookedCount, 0)} booked attendees`}
          />

          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(totalRevenue)}
            icon={<DollarSign className="w-5 h-5 text-emerald-700" />}
            trend={{ value: '+18.4%', isPositive: true }}
            subtitle="Verified coaching payments"
          />

          <StatCard
            title="Coach AI Balance"
            value={`${activeCoach?.aiBalance.toLocaleString()} pts`}
            icon={<Coins className="w-5 h-5 text-amber-600" />}
            subtitle="Available for workouts & diets"
          />
        </div>

        {/* Action Priority Grid (Today's Schedule & Renewals/Alerts) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <Card className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-700" />
                    Today's Scheduled Sessions
                  </h3>
                  <p className="text-xs text-slate-500">{todaySessions.length} sessions on the calendar today</p>
                </div>
                <Link
                  href="/dashboard/schedule"
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900"
                >
                  Full Calendar →
                </Link>
              </div>

              {todaySessions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                  No classes scheduled for today. Create a session to get started.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {todaySessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-white border border-slate-200 text-teal-700 shrink-0 mt-0.5 shadow-2xs">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{sess.title}</h4>
                            <Badge variant={sess.isOnline ? 'info' : 'default'} size="xs">
                              {sess.isOnline ? 'Virtual Stream' : 'In-Studio'}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatTime(sess.startTime)} – {formatTime(sess.endTime)} • {sess.location || sess.meetingLink}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-xs font-bold text-slate-800">
                            {sess.bookedCount} / {sess.capacity} Booked
                          </span>
                          <div className="w-24 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                            <div
                              className="bg-teal-700 h-full rounded-full"
                              style={{ width: `${(sess.bookedCount / sess.capacity) * 100}%` }}
                            />
                          </div>
                        </div>

                        <Link href={`/dashboard/classes/${sess.id}`}>
                          <Button variant="outline" size="xs">
                            Manage Class
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Next upcoming session tomorrow: 8:00 AM Vinyasa Flow</span>
              <Link href="/dashboard/schedule" className="text-teal-700 hover:text-teal-900 font-semibold">
                View Week Overview
              </Link>
            </div>
          </Card>

          {/* Pending Renewals & Unread Messages */}
          <div className="flex flex-col gap-4">
            {/* Renewals Card */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Upcoming Renewals
                </h3>
                <Badge variant="warning" size="xs">
                  {expiringSubs.length} Due Soon
                </Badge>
              </div>

              {expiringSubs.length === 0 ? (
                <p className="text-xs text-slate-500">All member subscriptions are in good standing.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {expiringSubs.map((sub) => {
                    return (
                      <div key={sub.id} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">Aman Verma</p>
                          <p className="text-[11px] text-amber-700 font-medium">Renews in 4 days (${sub.price})</p>
                        </div>
                        <Link href={`/dashboard/members/${sub.memberId}`}>
                          <Button variant="outline" size="xs">
                            Send Alert
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Unread Messages Card */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-700" />
                  Client Messages
                </h3>
                {unreadMessages.length > 0 && (
                  <Badge variant="danger" size="xs">
                    {unreadMessages.length} Unread
                  </Badge>
                )}
              </div>

              {unreadMessages.length === 0 ? (
                <p className="text-xs text-slate-500">No unread client messages.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {unreadMessages.slice(0, 3).map((msg) => (
                    <Link
                      key={msg.id}
                      href="/dashboard/messages"
                      className="py-2 block hover:bg-slate-50 transition-colors text-xs"
                    >
                      <p className="font-bold text-slate-800">{msg.senderName}</p>
                      <p className="text-slate-500 truncate mt-0.5">{msg.content}</p>
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href="/dashboard/messages"
                className="mt-3 block text-center text-xs font-semibold text-teal-700 hover:text-teal-900"
              >
                Open Messages Center →
              </Link>
            </Card>
          </div>
        </div>

        {/* Coach Content & Media Summary Card */}
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Coach Content & Media Library</span>
                  <Badge variant="info" size="xs">
                    {orgContents.length} Items
                  </Badge>
                </h3>
                <p className="text-xs text-slate-500">
                  {formatBytes(orgStorage.usedBytes)} / {formatBytes(orgStorage.limitBytes)} used •{' '}
                  <span className="text-emerald-700 font-medium">
                    {formatBytes(Math.max(0, orgStorage.limitBytes - orgStorage.usedBytes))} free
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/dashboard/content/create">
                <Button variant="secondary" size="xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> New Video / Short
                </Button>
              </Link>
              <Link href="/dashboard/content">
                <Button variant="outline" size="xs">
                  Manage Library →
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Previews of Recent 3 items */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {orgContents.slice(0, 3).map((c) => (
              <Link
                key={c.id}
                href="/dashboard/content"
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-3 group"
              >
                <div className="relative w-12 h-12 rounded bg-slate-200 overflow-hidden shrink-0">
                  {c.thumbnailUrl ? (
                    <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <Film className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                    {c.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {c.type.toUpperCase()} • {formatBytes(c.storageSizeBytes)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Financial & Member Growth Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Coaching Revenue Trend</h3>
                <p className="text-xs text-slate-500">Weekly subscription and class fee volume</p>
              </div>
              <Badge variant="success" size="xs">
                +24% Growth
              </Badge>
            </div>
            <LineChart data={revenueTrend} color="#0f766e" height={150} valuePrefix="$" />
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Activity Feed</h3>
                <p className="text-xs text-slate-500">Member actions and workout logs</p>
              </div>
              <Link href="/dashboard/reports" className="text-xs font-semibold text-teal-700">
                View Reports
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {activityLogs.slice(0, 4).map((act) => (
                <div key={act.id} className="py-2.5 flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-slate-800 leading-snug">
                      <span className="font-bold text-slate-900">{act.userName}</span> {act.details}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Add Member Modal */}
        <Modal
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          title="Onboard New Member"
          description="If user email exists globally, their identity is reused and linked to this organization."
          maxWidth="md"
        >
          <form onSubmit={handleAddMember} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              required
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="e.g. Aman Verma"
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="e.g. aman@example.com"
            />
            <Input
              label="Phone Number"
              value={newMemberPhone}
              onChange={(e) => setNewMemberPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddMemberOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Onboard Member
              </Button>
            </div>
          </form>
        </Modal>

        {/* Allocate AI Credits Modal */}
        <Modal
          isOpen={isAllocateOpen}
          onClose={() => setIsAllocateOpen(false)}
          title="Allocate AI Scanner Credits"
          description={`Transfer AI scanner credits from your coach balance (${activeCoach?.aiBalance} pts) to a trainee.`}
          maxWidth="sm"
        >
          <form onSubmit={handleAllocateCredits} className="flex flex-col gap-4">
            <Select
              label="Select Member"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              {orgMembers.map((m) => {
                return (
                  <option key={m.id} value={m.id}>
                    Member ID: {m.id} (Current: {m.aiCreditBalance || 0} pts)
                  </option>
                );
              })}
            </Select>

            <Input
              label="Credit Amount"
              type="number"
              required
              min="50"
              step="50"
              value={allocateAmount}
              onChange={(e) => setAllocateAmount(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsAllocateOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Allocate Credits
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
