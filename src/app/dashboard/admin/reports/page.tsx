'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { LineChart, BarChart } from '@/components/ui/SvgChart';
import { TrendingUp, DollarSign, Award, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SuperAdminReportsPage() {
  const mrrTrend = [
    { label: 'Oct', value: 180 },
    { label: 'Nov', value: 210 },
    { label: 'Dec', value: 247 },
    { label: 'Jan', value: 298 },
    { label: 'Feb', value: 346 },
    { label: 'Mar', value: 395 },
  ];

  const coachAcquisition = [
    { label: 'W1', value: 1 },
    { label: 'W2', value: 2 },
    { label: 'W3', value: 3 },
    { label: 'W4', value: 5 },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Growth & Financial Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Consolidated SaaS metrics, cohort retention, and platform revenue.
            </p>
          </div>

          <Button variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Annual Run Rate (ARR)"
            value="$4,740"
            icon={<DollarSign className="w-5 h-5 text-emerald-700" />}
            trend={{ value: '+24% YoY', isPositive: true }}
          />
          <StatCard
            title="LTV / CAC Ratio"
            value="4.8x"
            icon={<TrendingUp className="w-5 h-5 text-teal-700" />}
            subtitle="Strong unit economics"
          />
          <StatCard
            title="Net Revenue Retention"
            value="108%"
            icon={<Award className="w-5 h-5 text-indigo-700" />}
            subtitle="Driven by AI credit add-ons"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              Monthly Recurring Revenue ($)
            </h3>
            <p className="text-xs text-slate-500 mb-4">Steady coach subscription expansion</p>
            <LineChart data={mrrTrend} color="#0f766e" height={160} />
          </Card>

          <Card className="bg-white shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              New Coach Onboardings
            </h3>
            <p className="text-xs text-slate-500 mb-4">Weekly registration velocity</p>
            <BarChart data={coachAcquisition} color="#0284c7" height={160} />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
