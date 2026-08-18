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
import { Plus, Calculator } from 'lucide-react';

export default function ClientProgressPage() {
  const { currentUser } = useAuth();
  const { currentMembership } = useTenant();
  const { measurements, addMeasurement } = useData();
  const { showToast } = useToast();

  const memId = currentMembership?.id;
  const memberMeasurements = measurements.filter((m) => m.membershipId === memId);
  const latestMeas = memberMeasurements[memberMeasurements.length - 1];

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [weight, setWeight] = useState('80.0');
  const [waist, setWaist] = useState('84.5');
  const [bodyFat, setBodyFat] = useState('15.8');
  const [notes, setNotes] = useState('');

  const bmi = calculateBmi(latestMeas?.weightKg || 80, 178);
  const bmr = calculateBmr(latestMeas?.weightKg || 80, 178, 28, currentUser?.gender || 'male');
  const ibw = calculateIbw(178, currentUser?.gender || 'male');

  const weightChartData = memberMeasurements.map((m) => ({
    label: m.date.slice(5),
    value: m.weightKg,
  }));

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memId) return;

    addMeasurement({
      membershipId: memId,
      date: new Date().toISOString().split('T')[0],
      weightKg: parseFloat(weight),
      waistCm: waist ? parseFloat(waist) : undefined,
      bodyFatPercentage: bodyFat ? parseFloat(bodyFat) : undefined,
      notes,
    });

    showToast('Check-in Saved', 'Weight logged to your transformation history.', 'success');
    setIsLogModalOpen(false);
  };

  return (
    <ClientAppLayout>
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Progress & Body Logs</h1>
            <p className="text-xs text-slate-500 mt-0.5">Track your weight and body measurements.</p>
          </div>

          <Button
            variant="primary"
            size="xs"
            onClick={() => setIsLogModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Log Weight
          </Button>
        </div>

        {/* Current Weight & BMI Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Current Weight"
            value={`${latestMeas?.weightKg || 80} kg`}
            subtitle="Latest check-in"
          />
          <StatCard
            title="Body Mass Index"
            value={bmi.bmi}
            subtitle={bmi.category}
          />
        </div>

        {/* Weight History Chart */}
        <Card className="bg-white shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Weight Trend (kg)</h3>
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
                  <span className="font-bold text-slate-900 font-mono">{m.weightKg} kg</span>
                  {m.waistCm && (
                    <span className="text-slate-500 ml-2 font-mono">({m.waistCm}cm waist)</span>
                  )}
                  {m.notes && <p className="text-[11px] text-slate-500 mt-0.5">{m.notes}</p>}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{formatDate(m.date)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Modal: Log Weight */}
        <Modal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          title="Log Body Check-in"
          description="Record today's weight and measurements."
          maxWidth="sm"
        >
          <form onSubmit={handleAddWeight} className="flex flex-col gap-4">
            <Input
              label="Body Weight (kg)"
              type="number"
              step="0.1"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Waist (cm)"
                type="number"
                step="0.5"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
              />
              <Input
                label="Body Fat (%)"
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
              />
            </div>
            <Input
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Fasting morning weight"
            />

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsLogModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Check-in
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ClientAppLayout>
  );
}
