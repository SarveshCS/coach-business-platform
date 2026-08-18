'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, Card } from '@/components/ui/Card';
import { LineChart, DonutChart } from '@/components/ui/SvgChart';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/utils/formatters';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Users,
  Coins,
  DollarSign,
  ArrowRight,
  Brain,
} from 'lucide-react';

export default function SuperAdminDashboardPage() {
  const { coachAccounts, organizations, users, memberships } =
    useData();

  const totalCoaches = coachAccounts.length;
  const activeOrgs = organizations.filter((o) => o.status === 'active').length;
  const totalUsers = users.length;
  const totalMemberships = memberships.length;

  // Platform revenue calculation (approximate from platform subscriptions)
  const platformRevenue = 49 + 99 + 99; // Mock monthly platform MRR: ~$247 / mo

  // AI credit stats
  const totalCreditsSold = 15000;
  const totalCreditsConsumed = 3750;

  // Revenue chart mock data
  const revenueTrendData = [
    { label: 'Oct', value: 180 },
    { label: 'Nov', value: 210 },
    { label: 'Dec', value: 247 },
    { label: 'Jan', value: 298 },
    { label: 'Feb', value: 346 },
    { label: 'Mar', value: 395 },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">
                Super Admin Console
              </Badge>
              <span className="text-xs text-slate-500 font-medium">Platform Scope</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Platform Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              High-level overview of global coaches, tenant organizations, subscription revenue, and AI economy.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/admin/coaches">
              <Button variant="secondary" size="sm" leftIcon={<ShieldCheck className="w-4 h-4 text-teal-700" />}>
                Manage Coaches
              </Button>
            </Link>
            <Link href="/dashboard/admin/ai-credits">
              <Button variant="primary" size="sm" leftIcon={<Coins className="w-4 h-4" />}>
                AI Pool Controls
              </Button>
            </Link>
          </div>
        </div>

        {/* Top 4 Global Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Coach Accounts"
            value={totalCoaches}
            icon={<ShieldCheck className="w-5 h-5 text-teal-700" />}
            trend={{ value: '+33% MoM', isPositive: true }}
            subtitle={`${activeOrgs} active tenant organizations`}
          />

          <StatCard
            title="Global Users & Memberships"
            value={`${totalUsers} / ${totalMemberships}`}
            icon={<Users className="w-5 h-5 text-emerald-700" />}
            trend={{ value: '+18% growth', isPositive: true }}
            subtitle="Global identities / Linked memberships"
          />

          <StatCard
            title="Platform MRR"
            value={formatCurrency(platformRevenue)}
            icon={<DollarSign className="w-5 h-5 text-indigo-700" />}
            trend={{ value: '+14.2%', isPositive: true }}
            subtitle="Active Coach Subscriptions"
          />

          <StatCard
            title="AI Credits Pool"
            value={`${(totalCreditsSold - totalCreditsConsumed).toLocaleString()} pts`}
            icon={<Coins className="w-5 h-5 text-amber-700" />}
            trend={{ value: '25% consumed', isPositive: true }}
            subtitle="Distributed across coaches"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trendline */}
          <Card className="lg:col-span-2 flex flex-col justify-between bg-white shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Platform Subscription Revenue (MRR)
                  </h3>
                  <p className="text-xs text-slate-500">Monthly recurring coach subscription volume</p>
                </div>
                <Badge variant="info" size="xs">
                  Past 6 Months
                </Badge>
              </div>
              <div className="py-2">
                <LineChart data={revenueTrendData} color="#0f766e" height={160} valuePrefix="$" />
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Current Average Revenue Per Coach: $82.33/mo</span>
              <Link
                href="/dashboard/admin/reports"
                className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
              >
                <span>Full Financial Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          {/* AI Credit Allocation Donut */}
          <Card className="flex flex-col justify-between bg-white shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">AI Credits Distribution</h3>
                <Brain className="w-4 h-4 text-teal-700" />
              </div>

              <div className="flex justify-center my-2">
                <DonutChart
                  segments={[
                    { label: 'Coach Balances', value: 5400, color: '#0f766e' },
                    { label: 'Member Wallets', value: 1850, color: '#10b981' },
                    { label: 'Consumed (Diets/Scans)', value: 3750, color: '#6366f1' },
                    { label: 'Platform Reserve', value: 4000, color: '#f59e0b' },
                  ]}
                  size={140}
                  centerText="15k"
                  centerSubtext="Total Pool"
                />
              </div>

              <div className="mt-4 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-teal-700" /> Coach Balances
                  </span>
                  <span className="font-semibold text-slate-800">5,400 pts (36%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" /> Member Wallets
                  </span>
                  <span className="font-semibold text-slate-800">1,850 pts (12%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" /> Consumed Usage
                  </span>
                  <span className="font-semibold text-slate-800">3,750 pts (25%)</span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/admin/ai-credits"
              className="mt-4 pt-3 border-t border-slate-100 block text-center text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              Manage Platform AI Inventory →
            </Link>
          </Card>
        </div>

        {/* Organizations & Coaches Table Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Coaches */}
          <Card className="bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Active Coach Accounts</h3>
              <Link
                href="/dashboard/admin/coaches"
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                View all ({coachAccounts.length})
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {coachAccounts.map((coach) => (
                <div key={coach.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-teal-700 shrink-0">
                      {coach.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{coach.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{coach.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={coach.status === 'active' ? 'active' : 'danger'} size="xs">
                      {coach.status}
                    </Badge>
                    <span className="text-xs font-mono text-amber-700 font-semibold">
                      {coach.aiBalance.toLocaleString()} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Tenant Organizations */}
          <Card className="bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Tenant Organizations</h3>
              <Link
                href="/dashboard/admin/organizations"
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                View all ({organizations.length})
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {organizations.map((org) => {
                const orgMemberCount = memberships.filter((m) => m.organizationId === org.id).length;
                return (
                  <div key={org.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200 bg-slate-100 text-teal-800"
                      >
                        {org.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{org.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {orgMemberCount} members enrolled
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <Badge variant="info" size="xs">
                        {org.entitlements.maxMembers} max limit
                      </Badge>
                      <Badge variant="active" size="xs">
                        {org.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
