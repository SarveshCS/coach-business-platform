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
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { Membership } from '@/types';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Send,
} from 'lucide-react';

export default function CoachMembersPage() {
  const router = useRouter();
  const { currentOrganization } = useTenant();
  const {
    users,
    memberships,
    coachingPlans,
    createUserAndMembership,
    removeMembership,
  } = useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Membership | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [goals, setGoals] = useState('');
  const [notes, setNotes] = useState('');

  // Org members with user details
  const orgMemberships = useMemo(() => {
    return memberships.filter((m) => m.organizationId === orgId && m.role === 'member');
  }, [memberships, orgId]);

  const filteredMembers = useMemo(() => {
    return orgMemberships.filter((m) => {
      const user = users.find((u) => u.id === m.userId);
      if (!user) return false;

      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery));

      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orgMemberships, users, searchQuery, statusFilter]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const result = createUserAndMembership({
      name,
      email,
      phone,
      gender,
      dateOfBirth,
      organizationId: orgId,
      role: 'member',
      goals: goals ? goals.split(',').map((g) => g.trim()) : [],
      notes,
    });

    showToast(
      result.isNewUser ? 'Member Account Created' : 'Existing Global User Enrolled',
      `${result.user.name} has been enrolled in ${currentOrganization?.name || 'organization'}.`,
      'success'
    );

    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setDateOfBirth('');
    setGoals('');
    setNotes('');
  };

  const handleRemoveMember = () => {
    if (!memberToDelete) return;
    const user = users.find((u) => u.id === memberToDelete.userId);
    removeMembership(memberToDelete.id);
    showToast(
      'Membership Removed',
      `${user?.name || 'Member'}'s organization membership was removed. Their global account is preserved.`,
      'warning'
    );
    setMemberToDelete(null);
  };

  const handleResendInvite = (memberName: string) => {
    showToast('Invitation Resent', `A welcome invite link has been re-sent to ${memberName}.`, 'info');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Member Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage client memberships, onboarding, personalized plans, and AI credit allocations.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Member
          </Button>
        </div>

        {/* Filter Bar */}
        <Card className="p-3.5 bg-white shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1">
              <Input
                placeholder="Search by member name, email, or phone..."
                leftIcon={<Search className="w-4 h-4 text-teal-700" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Members ({orgMemberships.length})</option>
                <option value="active">Active Members</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Member Table */}
        <Card className="p-0 overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Member</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Community</th>
                  <th className="py-3.5 px-4">AI Balance</th>
                  <th className="py-3.5 px-4">Coaching Plan</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      No members matching the criteria. Click "Add Member" to onboard a trainee.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => {
                    const user = users.find((u) => u.id === m.userId);
                    const plan = coachingPlans.find((p) => p.id === m.currentCoachingPlanId);

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6">
                          <Link
                            href={`/dashboard/members/${m.id}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs text-teal-700 shrink-0">
                              {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                user?.name.charAt(0)
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                                {user?.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                          </Link>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant={m.status === 'active' ? 'active' : 'default'} size="xs">
                            {m.status}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge
                            variant={m.communityStatus === 'active' ? 'active' : 'danger'}
                            size="xs"
                          >
                            {m.communityStatus}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-semibold text-amber-700">
                            {m.aiCreditBalance || 0} pts
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-xs text-slate-700 truncate max-w-[140px] block">
                            {plan?.name || 'Personal Training Plan'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/dashboard/members/${m.id}`}>
                              <Button variant="outline" size="xs">
                                Profile
                              </Button>
                            </Link>
                            <button
                              onClick={() => handleResendInvite(user?.name || 'Member')}
                              className="p-1.5 rounded-md text-slate-400 hover:text-teal-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Resend Invite"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setMemberToDelete(m)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove Membership"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

        {/* Add Member Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Member"
          description="Enrolls the trainee into this organization. If their email already exists globally, their identity is reused without duplicate registration."
          maxWidth="md"
        >
          <form onSubmit={handleAddMember} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Divya Sharma"
            />

            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. divya@example.com"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
              />
              <Select
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </div>

            <Input
              label="Fitness Goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g. Fat Loss, Build 3kg muscle, Posture correction"
              helperText="Separate multiple goals with commas."
            />

            <Input
              label="Coach Onboarding Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Prior injuries, food allergies, scheduling preferences..."
            />

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Complete Onboarding
              </Button>
            </div>
          </form>
        </Modal>

        {/* Remove Member Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!memberToDelete}
          onClose={() => setMemberToDelete(null)}
          onConfirm={handleRemoveMember}
          title="Remove Organization Membership"
          message={`Are you sure you want to remove this member from ${currentOrganization?.name}? Their global user identity will NOT be deleted, and other active memberships in other organizations will remain intact.`}
          confirmText="Remove Membership"
          variant="danger"
        />
      </div>
    </DashboardLayout>
  );
}
