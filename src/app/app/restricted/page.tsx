'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { ShieldAlert, Key, LogOut, ArrowRight } from 'lucide-react';

export default function RestrictedOrphanPage() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { addMembership, organizations } = useData();
  const { switchOrganization } = useTenant();
  const { showToast } = useToast();

  const [inviteCode, setInviteCode] = useState('');

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Simulate join code resolution
    const targetOrg = organizations[0]; // default to Rahul Fitness Hub
    if (!targetOrg) return;

    addMembership({
      organizationId: targetOrg.id,
      userId: currentUser.id,
      role: 'member',
      status: 'active',
      communityStatus: 'active',
      aiCreditBalance: 150,
      goals: ['General Fitness', 'Body Recomp'],
    });

    switchOrganization(targetOrg.id);
    showToast(
      'Enrolled Successfully',
      `You are now a member of ${targetOrg.name}. Welcome aboard!`,
      'success'
    );

    router.push('/app');
  };

  const handleQuickDemoJoin = (orgId: string) => {
    if (!currentUser) return;
    const targetOrg = organizations.find((o) => o.id === orgId) || organizations[0];

    addMembership({
      organizationId: targetOrg.id,
      userId: currentUser.id,
      role: 'member',
      status: 'active',
      communityStatus: 'active',
      aiCreditBalance: 200,
      goals: ['Lean Muscle', 'Strength'],
    });

    switchOrganization(targetOrg.id);
    showToast('Enrolled in Demo Org', `Connected to ${targetOrg.name}!`, 'success');
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-900">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Brand */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-3 shadow-2xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            No Active Organization Membership
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Logged in as <span className="text-slate-900 font-bold">{currentUser?.email}</span>. You are not currently connected to any active coaching gyms.
          </p>
        </div>

        {/* Join by Invite Code Card */}
        <Card className="p-6 bg-white shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Key className="w-4 h-4 text-teal-700" />
            Enter Coach Invite Code
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            If your trainer provided an invite code, enter it below to join their organization.
          </p>

          <form onSubmit={handleJoinByCode} className="flex flex-col gap-3">
            <Input
              placeholder="e.g. RFH-2026 or TRANSFORM-NOW"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="uppercase tracking-widest text-center font-mono font-bold"
            />
            <Button variant="primary" size="md" type="submit" className="w-full">
              Join Organization
            </Button>
          </form>
        </Card>

        {/* Quick Demo Instant Join */}
        <Card className="p-5 border-dashed border-slate-300 bg-white text-center shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Demo Simulator Action
          </span>
          <p className="text-xs text-slate-500 mb-4">
            Instantly provision a client membership into one of the demo organizations:
          </p>

          <div className="flex flex-col gap-2">
            {organizations.slice(0, 2).map((org) => (
              <Button
                key={org.id}
                variant="outline"
                size="sm"
                className="w-full justify-between"
                onClick={() => handleQuickDemoJoin(org.id)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                <span>{org.name.charAt(0)} Join {org.name}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Logout */}
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              router.push('/login');
            }}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="text-slate-500 hover:text-slate-900"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
