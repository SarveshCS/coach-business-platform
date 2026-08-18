'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { BarChart } from '@/components/ui/SvgChart';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { calculateBmi, calculateBmr, calculateIbw, calculateTdee } from '@/utils/calculators';
import { TrendingUp, Calculator, Activity, Users } from 'lucide-react';

export default function CoachProgressPage() {
  const { currentOrganization } = useTenant();
  const { measurements, memberships } = useData();

  // Calculator state
  const [calcWeight, setCalcWeight] = useState(78);
  const [calcHeight, setCalcHeight] = useState(178);
  const [calcAge, setCalcAge] = useState(28);
  const [calcGender, setCalcGender] = useState<'male' | 'female'>('male');
  const [calcActivity, setCalcActivity] = useState<'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active'>('moderate');

  const bmiRes = calculateBmi(calcWeight, calcHeight);
  const bmrRes = calculateBmr(calcWeight, calcHeight, calcAge, calcGender);
  const ibwRes = calculateIbw(calcHeight, calcGender);
  const tdeeRes = calculateTdee(bmrRes, calcActivity);

  // Aggregated progress metrics
  const avgWeightLoss = '-3.4 kg';
  const complianceRate = '88.5%';

  const adherenceChart = [
    { label: 'Week 1', value: 82 },
    { label: 'Week 2', value: 86 },
    { label: 'Week 3', value: 89 },
    { label: 'Week 4', value: 92 },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Client Progress & Health Calculators
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Aggregate client transformation metrics and scientific physiological formulas.
          </p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Avg. 30-Day Weight Loss"
            value={avgWeightLoss}
            icon={<TrendingUp className="w-5 h-5 text-emerald-700" />}
            trend={{ value: 'Across cutting cohort', isPositive: true }}
          />
          <StatCard
            title="Workout Adherence Rate"
            value={complianceRate}
            icon={<Activity className="w-5 h-5 text-teal-700" />}
            trend={{ value: '+4.2% this month', isPositive: true }}
          />
          <StatCard
            title="Total Active Check-ins"
            value={measurements.length}
            icon={<Users className="w-5 h-5 text-indigo-700" />}
            subtitle="Verified client measurements"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Adherence Chart */}
          <Card className="bg-white shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              Monthly Workout Compliance Trend (%)
            </h3>
            <p className="text-xs text-slate-500 mb-4">Percentage of assigned workout sets checked off</p>
            <BarChart data={adherenceChart} color="#0f766e" height={160} />
          </Card>

          {/* Interactive Calculator Engine */}
          <Card className="bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-600" />
                Clinical Health & Calorie Calculator
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input
                label="Weight (kg)"
                type="number"
                value={calcWeight}
                onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Height (cm)"
                type="number"
                value={calcHeight}
                onChange={(e) => setCalcHeight(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <Input
                label="Age (years)"
                type="number"
                value={calcAge}
                onChange={(e) => setCalcAge(parseInt(e.target.value, 10) || 0)}
              />
              <Select
                label="Gender"
                value={calcGender}
                onChange={(e) => setCalcGender(e.target.value as any)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Select>
              <Select
                label="Activity"
                value={calcActivity}
                onChange={(e) => setCalcActivity(e.target.value as any)}
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light (1-2x/wk)</option>
                <option value="moderate">Moderate (3-5x/wk)</option>
                <option value="very_active">Very Active (6x/wk)</option>
              </Select>
            </div>

            {/* Live Computed Output Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div className="p-2">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">BMI</span>
                <span className="font-bold text-slate-900">{bmiRes.bmi}</span>
                <span className={`block text-[10px] ${bmiRes.color}`}>{bmiRes.category}</span>
              </div>
              <div className="p-2">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">BMR</span>
                <span className="font-bold text-teal-700">{bmrRes} kcal</span>
                <span className="text-[10px] text-slate-500">Base Burn</span>
              </div>
              <div className="p-2">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">TDEE</span>
                <span className="font-bold text-emerald-700">{tdeeRes} kcal</span>
                <span className="text-[10px] text-slate-500">Daily Burn</span>
              </div>
              <div className="p-2">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Ideal Weight</span>
                <span className="font-bold text-amber-700">{ibwRes} kg</span>
                <span className="text-[10px] text-slate-500">Devine Formula</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
