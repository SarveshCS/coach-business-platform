'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { LineChart, BarChart } from '@/components/ui/SvgChart';
import { Button } from '@/components/ui/Button';
import { Users, DollarSign, Award, Download, Dumbbell } from 'lucide-react';

export default function CoachReportsPage() {
  const revenueTrend = [
    { label: 'Jan', value: 3400 },
    { label: 'Feb', value: 4200 },
    { label: 'Mar', value: 4890 },
  ];

  const attendanceWeekly = [
    { label: 'W1', value: 32 },
    { label: 'W2', value: 38 },
    { label: 'W3', value: 44 },
    { label: 'W4', value: 48 },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Business & Client Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Analyze retention rates, class attendance trends, revenue velocity, and client compliance.
            </p>
          </div>

          <Button variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export Summary PDF
          </Button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard
            title="Client Retention Rate"
            value="94.2%"
            icon={<Award className="w-5 h-5 text-teal-700" />}
            trend={{ value: '+2.1%', isPositive: true }}
          />
          <StatCard
            title="Average Client Lifetime"
            value="6.2 mos"
            icon={<Users className="w-5 h-5 text-indigo-700" />}
            subtitle="Industry avg: 4.0 mos"
          />
          <StatCard
            title="Avg Monthly Revenue"
            value="$4,890"
            icon={<DollarSign className="w-5 h-5 text-emerald-700" />}
            trend={{ value: '+16.4%', isPositive: true }}
          />
          <StatCard
            title="Total Workouts Logged"
            value="184 sets"
            icon={<Dumbbell className="w-5 h-5 text-amber-700" />}
            subtitle="Past 30 days"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              Monthly Coaching Revenue ($)
            </h3>
            <p className="text-xs text-slate-500 mb-4">Subscription and pass income trajectory</p>
            <LineChart data={revenueTrend} color="#0f766e" height={160} valuePrefix="$" />
          </Card>

          <Card className="bg-white shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              Class Attendance Volume (Weekly)
            </h3>
            <p className="text-xs text-slate-500 mb-4">In-studio and live stream participant check-ins</p>
            <BarChart data={attendanceWeekly} color="#0284c7" height={160} />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
