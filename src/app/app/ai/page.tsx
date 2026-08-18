'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ClientAppLayout } from '@/components/layout/ClientAppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { simulateAiFoodScan } from '@/utils/aiSimulator';
import { AiScanResult } from '@/types';
import {
  Camera,
  Coins,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function ClientAiScannerPage() {
  const { currentOrganization, currentMembership } = useTenant();
  const { consumeCredits } = useData();
  const { showToast } = useToast();

  const balance = currentMembership?.aiCreditBalance || 0;
  const isOutOfCredits = balance < 50;

  // Sample meal photo choices for easy 1-click simulation
  const samplePhotos = [
    {
      name: 'Salmon & Veggies',
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Chicken Rice Bowl',
      url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Greek Protein Salad',
      url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const [selectedPhoto, setSelectedPhoto] = useState(samplePhotos[0].url);
  const [customContext, setCustomContext] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [scanResult, setScanResult] = useState<AiScanResult | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOutOfCredits) return;

    setIsScanning(true);
    setScanResult(null);

    setScanStep('Detecting food items & ingredients...');
    await new Promise((r) => setTimeout(r, 600));
    setScanStep('Estimating portion volumes & density...');
    await new Promise((r) => setTimeout(r, 600));
    setScanStep('Calculating macro ratios & nutrient score...');
    await new Promise((r) => setTimeout(r, 500));

    const result = await simulateAiFoodScan(selectedPhoto, customContext);

    // Deduct 50 credits from member's wallet
    if (currentMembership) {
      consumeCredits(
        currentMembership.id,
        50,
        `AI Food Scan: ${result.dishName}`,
        'ai_food_scanner',
        currentOrganization?.id
      );
    }

    setScanResult(result);
    setIsScanning(false);
    showToast('Meal Analyzed', '50 credits deducted. Macro breakdown ready.', 'success');
  };

  const handleSaveToDiary = () => {
    showToast('Saved to Food Diary', 'Meal logged to today\'s nutrition summary.', 'success');
    setScanResult(null);
  };

  return (
    <ClientAppLayout>
      <div className="flex flex-col gap-5 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Badge variant="info" size="xs">
                Food Vision Scanner
              </Badge>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              AI Nutrition & Food Scanner
            </h1>
          </div>

          <Link
            href="/app/ai/wallet"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold font-mono"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>{balance} pts</span>
          </Link>
        </div>

        {/* OUT OF CREDITS BLOCKED STATE */}
        {isOutOfCredits ? (
          <Card className="p-8 text-center bg-rose-50 border-rose-200 flex flex-col items-center">
            <div className="w-14 h-14 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
              <Coins className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">You're Out of AI Credits</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mt-2 mb-6 leading-relaxed">
              You need at least 50 AI credits to scan a meal. In this organization, AI scanner credits are managed and allocated directly by your coach.
            </p>

            <Link href="/app/messages" className="w-full max-w-xs">
              <Button variant="primary" size="md" className="w-full">
                Message Coach for Credits
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Image Selector / Upload Simulation Card */}
            <Card className="bg-white shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                1. Select Meal Photo
              </h3>

              {/* Sample Photo Thumbnails */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {samplePhotos.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedPhoto(p.url)}
                    className={`relative rounded-xl overflow-hidden aspect-video border transition-all cursor-pointer ${
                      selectedPhoto === p.url
                        ? 'border-teal-700 ring-2 ring-teal-700/20'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-[10px] text-white py-0.5 text-center font-semibold truncate px-1">
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Image Preview */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video max-h-60 mb-4 shadow-2xs">
                <img src={selectedPhoto} alt="Selected meal" className="w-full h-full object-cover" />
              </div>

              <Input
                label="Optional Context / Ingredients"
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder="e.g. Cooked with 1 tbsp olive oil, 2 eggs"
              />

              <Button
                variant="primary"
                size="lg"
                onClick={handleScan}
                disabled={isScanning}
                className="w-full mt-4"
                leftIcon={
                  isScanning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )
                }
              >
                {isScanning ? scanStep : 'Analyze Nutrition (Cost: 50 pts)'}
              </Button>
            </Card>

            {/* Scan Output Card */}
            {scanResult && (
              <Card className="border-teal-700/40 shadow-xs bg-white animate-in fade-in zoom-in-95">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <Badge variant="info" size="xs" className="mb-1">
                      Estimated Nutrition Breakdown
                    </Badge>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      {scanResult.dishName}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">{scanResult.portionEstimate}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Health Score</span>
                    <span className="text-sm font-extrabold text-emerald-700 font-mono">
                      {scanResult.healthScore} / 100
                    </span>
                  </div>
                </div>

                {/* Macro Pills */}
                <div className="grid grid-cols-4 gap-2 my-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Calories</span>
                    <span className="font-extrabold text-slate-900 font-mono">{scanResult.calories}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Protein</span>
                    <span className="font-bold text-emerald-700 font-mono">{scanResult.proteinGrams}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Carbs</span>
                    <span className="font-bold text-teal-700 font-mono">{scanResult.carbsGrams}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Fats</span>
                    <span className="font-bold text-amber-700 font-mono">{scanResult.fatGrams}g</span>
                  </div>
                </div>

                {/* AI Observations */}
                <div className="flex flex-col gap-1.5 mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Nutritional Observations
                  </p>
                  {scanResult.observations.map((obs, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{obs}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-snug mb-4">
                  <span className="font-semibold text-slate-700">Note:</span> Nutritional breakdown is an estimated AI visual approximation, not certified clinical lab analysis.
                </div>

                <Button variant="primary" size="md" onClick={handleSaveToDiary} className="w-full">
                  Add to Today's Food Diary
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </ClientAppLayout>
  );
}
