'use client';

import React, { useState } from 'react';
import { ClientAppLayout } from '@/components/layout/ClientAppLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LineChart } from '@/components/ui/SvgChart';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { calculateBmi, calculateBmr, calculateIbw } from '@/utils/calculators';
import { formatDate } from '@/utils/formatters';
import { Plus, Calculator, Ruler, Activity } from 'lucide-react';

export default function ClientProgressPage() {
  const { currentUser } = useAuth();
  const { currentMembership } = useTenant();
  const { measurements, addMeasurement, updateUser } = useData();
  const { showToast } = useToast();

  const memId = currentMembership?.id;
  const memberMeasurements = measurements.filter((m) => m.membershipId === memId);
  const latestMeas = memberMeasurements[memberMeasurements.length - 1];

  const userHeight = latestMeas?.heightCm || currentUser?.heightCm || 178;

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [weight, setWeight] = useState(String(latestMeas?.weightKg || '80.0'));
  const [height, setHeight] = useState(String(userHeight));
  const [waist, setWaist] = useState(String(latestMeas?.waistCm || '84.5'));
  const [chest, setChest] = useState(String(latestMeas?.chestCm || '105.0'));
  const [arms, setArms] = useState(String(latestMeas?.armsCm || '37.5'));
  const [bodyFat, setBodyFat] = useState(String(latestMeas?.bodyFatPercentage || '15.8'));
  const [notes, setNotes] = useState('');

  const currentWeight = latestMeas?.weightKg || 80.0;
  const currentHeight = userHeight;

  const bmi = calculateBmi(currentWeight, currentHeight);
  const bmr = calculateBmr(currentWeight, currentHeight, 28, currentUser?.gender || 'male');
  const ibw = calculateIbw(currentHeight, currentUser?.gender || 'male');

  // Modal live calculations
  const modalWeightNum = parseFloat(weight) || currentWeight;
  const modalHeightNum = parseFloat(height) || currentHeight;
  const modalBmi = calculateBmi(modalWeightNum, modalHeightNum);

  const weightChartData = memberMeasurements.map((m) => ({
    label: m.date.slice(5),
    value: m.weightKg,
  }));

  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memId) return;

    const parsedWeight = parseFloat(weight);
    const parsedHeight = parseFloat(height);

    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      showToast('Invalid Weight', 'Please enter a valid weight in kilograms.', 'error');
      return;
    }

    addMeasurement({
      membershipId: memId,
      date: new Date().toISOString().split('T')[0],
      weightKg: parsedWeight,
      heightCm: !isNaN(parsedHeight) ? parsedHeight : undefined,
      waistCm: waist ? parseFloat(waist) : undefined,
      chestCm: chest ? parseFloat(chest) : undefined,
      armsCm: arms ? parseFloat(arms) : undefined,
      bodyFatPercentage: bodyFat ? parseFloat(bodyFat) : undefined,
      notes,
    });

    // Sync height to user profile
    if (currentUser && !isNaN(parsedHeight)) {
      updateUser(currentUser.id, { heightCm: parsedHeight });
    }

    showToast('Body Metrics Saved', 'Check-in recorded to your transformation history.', 'success');
    setIsLogModalOpen(false);
  };

  return (
    <ClientAppLayout>
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Progress & Body Logs</h1>
            <p className="text-xs text-slate-500 mt-0.5">Track your height, weight, and circumferences.</p>
          </div>

          <Button
            variant="primary"
            size="xs"
            onClick={() => setIsLogModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Log Body Metrics
          </Button>
        </div>

        {/* 4 Biometric Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            title="Current Weight"
            value={`${currentWeight} kg`}
            subtitle="Latest check-in"
          />
          <StatCard
            title="Height"
            value={`${currentHeight} cm`}
            subtitle={`${Math.floor(currentHeight / 30.48)}'${Math.round((currentHeight % 30.48) / 2.54)}" stature`}
          />
          <StatCard
            title="Body Mass Index"
            value={bmi.bmi}
            subtitle={bmi.category}
          />
          <StatCard
            title="Body Fat"
            value={`${latestMeas?.bodyFatPercentage ? `${latestMeas.bodyFatPercentage}%` : '15.8%'}`}
            subtitle="Calculated range"
          />
        </div>

        {/* Weight History Chart */}
        <Card className="bg-white shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Weight Progression (kg)</h3>
            <span className="text-[11px] text-emerald-700 font-bold">-2.1 kg overall</span>
          </div>
          <LineChart data={weightChartData} color="#0f766e" height={140} valueSuffix=" kg" />
        </Card>

        {/* Bio Calculators Card */}
        <Card className="bg-white shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-amber-600" />
            Metabolic & Target Benchmarks
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Basal Metabolic Rate</span>
              <span className="text-base font-bold text-teal-700 mt-0.5 block">{bmr} kcal/day</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Ideal Clinical Weight</span>
              <span className="text-base font-bold text-amber-700 mt-0.5 block">{ibw} kg</span>
            </div>
          </div>
        </Card>

        {/* Recent Check-ins History Table */}
        <Card className="p-0 overflow-hidden bg-white shadow-2xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900">Check-in History</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {memberMeasurements.map((m) => (
              <div key={m.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono">{m.weightKg} kg</span>
                    {m.heightCm && (
                      <span className="text-slate-500 font-mono text-[11px]">({m.heightCm} cm)</span>
                    )}
                    {m.waistCm && (
                      <span className="text-slate-500 font-mono text-[11px]">• {m.waistCm}cm waist</span>
                    )}
                    {m.bodyFatPercentage && (
                      <span className="text-slate-500 font-mono text-[11px]">• {m.bodyFatPercentage}% BF</span>
                    )}
                  </div>
                  {m.notes && <p className="text-[11px] text-slate-500 mt-0.5">{m.notes}</p>}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{formatDate(m.date)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Modal: Log Body Metrics & Check-in */}
        <Modal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          title="Log Body Metrics & Check-in"
          description="Record today's weight, height, and circumferences."
          maxWidth="md"
        >
          <form onSubmit={handleSaveMetrics} className="flex flex-col gap-3.5">
            {/* Live Calculated Stats Preview Banner */}
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Live BMI Metric</p>
                <p className="text-sm font-extrabold text-teal-950 font-mono mt-0.5">
                  {modalBmi.bmi} • <span className="font-sans text-xs font-semibold">{modalBmi.category}</span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>

            {/* Row 1: Weight & Height */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Body Weight (kg)"
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 78.5"
              />
              <Input
                label="Height (cm)"
                type="number"
                step="0.5"
                required
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 178"
              />
            </div>

            {/* Row 2: Body Fat & Waist */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Body Fat (%)"
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="e.g. 15.5"
              />
              <Input
                label="Waist (cm)"
                type="number"
                step="0.5"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="e.g. 84.0"
              />
            </div>

            {/* Row 3: Chest & Arms */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Chest (cm)"
                type="number"
                step="0.5"
                value={chest}
                onChange={(e) => setChest(e.target.value)}
                placeholder="e.g. 105.0"
              />
              <Input
                label="Arms / Biceps (cm)"
                type="number"
                step="0.5"
                value={arms}
                onChange={(e) => setArms(e.target.value)}
                placeholder="e.g. 37.5"
              />
            </div>

            <Input
              label="Notes & Observations"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Fasting morning weigh-in, feeling energized"
            />

            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsLogModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Body Metrics
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ClientAppLayout>
  );
}
