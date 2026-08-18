'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClientAppLayout } from '@/components/layout/ClientAppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import {
  Building2,
  Save,
  CreditCard,
  TrendingUp,
  Calendar,
  Film,
  Coins,
  ChevronRight,
  User,
} from 'lucide-react';

export default function ClientProfilePage() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { currentOrganization, currentMembership, availableOrganizations, switchOrganization } = useTenant();
  const { updateUser } = useData();
  const { showToast } = useToast();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [height, setHeight] = useState(String(currentUser?.heightCm || '178'));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const parsedHeight = parseFloat(height);

    updateUser(currentUser.id, {
      name,
      phone,
      heightCm: !isNaN(parsedHeight) ? parsedHeight : undefined,
    });

    showToast('Profile Updated', 'Your profile details have been saved.', 'success');
  };

  const handleSwitch = (orgId: string, orgName: string) => {
    switchOrganization(orgId);
    showToast('Switched Gym / Coach', `Active organization set to "${orgName}".`, 'info');
  };

  return (
    <ClientAppLayout>
      <div className="flex flex-col gap-5 pb-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Athlete Account Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your identity, subscriptions, and memberships.</p>
        </div>

        {/* Profile Card */}
        <Card className="bg-white shadow-2xs">
          <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-xl text-teal-700 shadow-2xs shrink-0">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser?.name.charAt(0)
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">{currentUser?.name}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser?.email}</p>
              <Badge variant="org" size="xs" className="mt-1">
                Active in {currentOrganization?.name}
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
              <Input
                label="Height (cm)"
                type="number"
                step="0.5"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="178"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              type="submit"
              className="mt-2"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile
            </Button>
          </form>
        </Card>

        {/* Quick App Services / Navigation Shortcuts */}
        <Card className="p-2 bg-white shadow-2xs divide-y divide-slate-100">
          <Link
            href="/app/schedule"
            className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  Class Schedule & Bookings
                </p>
                <p className="text-[10px] text-slate-500">Live studio sessions and virtual streams</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
          </Link>

          <Link
            href="/app/coach"
            className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  Coach Video & Shorts Library
                </p>
                <p className="text-[10px] text-slate-500">Masterclasses, drills, and form guides</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
          </Link>

          <Link
            href="/app/progress"
            className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Progress & Measurements
                </p>
                <p className="text-[10px] text-slate-500">Weight logger, trendlines & body metrics</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
          </Link>

          <Link
            href="/app/subscription"
            className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                  Coaching Subscription & Invoices
                </p>
                <p className="text-[10px] text-slate-500">Active packages, renewals & billing history</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
          </Link>

          <Link
            href="/app/ai/wallet"
            className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                  AI Credit Wallet ({currentMembership?.aiCreditBalance || 0} pts)
                </p>
                <p className="text-[10px] text-slate-500">Token balance and food scan usage history</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
          </Link>
        </Card>

        {/* Multi-Organization Switcher Card */}
        <Card className="bg-white shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-700" />
                Your Coach & Gym Memberships
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                You belong to {availableOrganizations.length} {availableOrganizations.length === 1 ? 'organization' : 'organizations'}.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {availableOrganizations.map((org) => {
              const isActive = org.id === currentOrganization?.id;
              return (
                <div
                  key={org.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    isActive
                      ? 'border-teal-700 bg-teal-50/50'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-sm font-bold text-teal-800 border border-slate-200 shrink-0">
                      {org.branding.logo || org.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{org.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Personal Coaching Hub
                      </span>
                    </div>
                  </div>

                  {isActive ? (
                    <Badge variant="active" size="xs">
                      Active Space
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleSwitch(org.id, org.name)}
                    >
                      Switch
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Logout */}
        <Button
          variant="danger"
          size="md"
          className="w-full cursor-pointer"
          onClick={() => {
            logout();
            router.push('/login');
          }}
        >
          Sign Out of Account
        </Button>
      </div>
    </ClientAppLayout>
  );
}
