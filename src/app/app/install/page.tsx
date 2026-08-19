'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { useTenant } from '@/context/TenantContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  PlusSquare,
  ArrowRight,
  Sparkles,
  Zap,
  Dumbbell,
  Apple,
  Camera,
  Layers,
  ChevronDown,
  ChevronUp,
  Monitor,
  HelpCircle,
} from 'lucide-react';

export default function ClientPwaInstallPage() {
  const router = useRouter();
  const { currentOrganization } = useTenant();
  const {
    isInstallable,
    isStandalone,
    installStatus,
    platform,
    promptInstall,
  } = usePwaInstall();

  const [activePlatformTab, setActivePlatformTab] = useState<'ios' | 'android' | 'desktop'>(
    platform === 'ios' ? 'ios' : platform === 'android' ? 'android' : 'desktop'
  );
  const [showInstructions, setShowInstructions] = useState(platform === 'ios' || !isInstallable);

  const handleInstallClick = async () => {
    if (isStandalone || installStatus === 'installed') {
      router.push('/app');
      return;
    }

    if (isInstallable) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        setTimeout(() => {
          router.push('/app');
        }, 1200);
      }
    } else {
      setShowInstructions(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 tracking-tight">
                  {currentOrganization?.name || 'Coach Business Platform'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Athlete Companion App</p>
            </div>
          </div>

          <Link href="/app">
            <Button variant="ghost" size="xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Web App
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-lg mx-auto w-full px-4 py-6 sm:py-8 flex flex-col gap-6">
        {/* Installed State Banner */}
        {isStandalone && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-emerald-950">App Installed & Active</h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                You are running the dedicated standalone client experience.
              </p>
              <Button
                variant="primary"
                size="xs"
                className="mt-3"
                onClick={() => router.push('/app')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Launch Athlete Hub
              </Button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center flex flex-col items-center">
          <Badge variant="org" size="xs" className="mb-2.5">
            Progressive Web Application
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Your coaching experience, right on your phone.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md">
            Fast, app-like performance with 1-tap food vision scanning, routine check-offs, and direct coach communication.
          </p>
        </div>

        {/* High-Fidelity Phone Preview Mockup */}
        <div className="relative mx-auto w-full max-w-[340px] pt-2">
          {/* Outer Phone Shell */}
          <div className="relative rounded-[2.5rem] bg-slate-900 p-3 shadow-2xl border-4 border-slate-800">
            {/* Speaker / Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-900/90" />
            </div>

            {/* Inner Phone Screen Content */}
            <div className="relative rounded-[2rem] bg-slate-50 overflow-hidden border border-slate-700/40 p-4 pt-7 flex flex-col gap-3 text-left">
              {/* Mock App Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-700 text-white flex items-center justify-center text-[10px] font-bold">
                    RF
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-900 block leading-tight">
                      {currentOrganization?.name || 'Rahul Fitness'}
                    </span>
                    <span className="text-[9px] text-slate-400">Today&apos;s Protocol</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  Active
                </span>
              </div>

              {/* Mock Workout Card */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Today&apos;s Workout</span>
                  <span className="text-[10px] font-bold text-emerald-700">4 Exercises</span>
                </div>
                <p className="text-xs font-bold text-slate-900 mt-1">Chest &amp; Triceps Hypertrophy</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-700">
                    Barbell Bench: 4x8 @ 85kg
                  </span>
                </div>
              </div>

              {/* Mock Nutrition & Scan */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Daily Calories</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">2,400 / 2,650 kcal</p>
                  <p className="text-[9px] text-teal-700 font-bold">185g Protein target</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs">
                  <Camera className="w-4 h-4" />
                </div>
              </div>

              {/* Mock Bottom Nav Bar */}
              <div className="mt-1 pt-2 border-t border-slate-200 flex items-center justify-around text-[9px] font-medium text-slate-400">
                <span className="text-teal-700 font-bold">Home</span>
                <span>Plan</span>
                <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center -mt-3 shadow-xs">
                  <Camera className="w-3 h-3" />
                </span>
                <span>Feed</span>
                <span>You</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary State-Aware Installation Controls */}
        <Card className="bg-white shadow-sm border border-slate-200/90 text-center flex flex-col gap-3">
          {installStatus === 'accepted' ? (
            <div className="py-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900">Installation Completed!</h3>
              <p className="text-xs text-slate-500 mt-1">
                The client app is ready on your home screen or app menu.
              </p>
              <Button
                variant="primary"
                size="md"
                className="w-full mt-4"
                onClick={() => router.push('/app')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Launch Client App
              </Button>
            </div>
          ) : isStandalone ? (
            <div className="py-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900">App Already Installed</h3>
              <p className="text-xs text-slate-500 mt-1">
                You are currently running in dedicated standalone client mode.
              </p>
              <Button
                variant="primary"
                size="md"
                className="w-full mt-4"
                onClick={() => router.push('/app')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Open Client App
              </Button>
            </div>
          ) : isInstallable ? (
            <div>
              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-md py-3 text-sm font-bold"
                onClick={handleInstallClick}
                leftIcon={<Download className="w-5 h-5" />}
              >
                Install Client App
              </Button>
              <p className="text-[11px] text-slate-400 mt-2">
                1-tap prompt • No app store download needed
              </p>
            </div>
          ) : (
            <div>
              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-md py-3 text-sm font-bold"
                onClick={() => setShowInstructions(true)}
                leftIcon={<Smartphone className="w-5 h-5" />}
              >
                Install on Your Device
              </Button>
              <p className="text-[11px] text-slate-400 mt-2">
                Follow quick step-by-step instructions below
              </p>
            </div>
          )}

          {/* Secondary Web Route */}
          {!isStandalone && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4">
              <Link
                href="/app"
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
              >
                Continue in Web Browser
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </Card>

        {/* Step-by-Step Platform Guidance Accordion */}
        <Card className="bg-white shadow-2xs border border-slate-200">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex items-center justify-between text-left font-bold text-sm text-slate-900"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-teal-700" />
              Installation Guide by Device
            </span>
            {showInstructions ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showInstructions && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-4">
              {/* Platform Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setActivePlatformTab('ios')}
                  className={`py-1.5 rounded-md font-bold transition-colors ${
                    activePlatformTab === 'ios'
                      ? 'bg-white text-teal-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  iOS / Safari
                </button>
                <button
                  type="button"
                  onClick={() => setActivePlatformTab('android')}
                  className={`py-1.5 rounded-md font-bold transition-colors ${
                    activePlatformTab === 'android'
                      ? 'bg-white text-teal-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Android
                </button>
                <button
                  type="button"
                  onClick={() => setActivePlatformTab('desktop')}
                  className={`py-1.5 rounded-md font-bold transition-colors ${
                    activePlatformTab === 'desktop'
                      ? 'bg-white text-teal-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Desktop
                </button>
              </div>

              {/* iOS Instructions */}
              {activePlatformTab === 'ios' && (
                <div className="flex flex-col gap-3 text-xs text-slate-700">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        Tap the Share button
                        <Share2 className="w-3.5 h-3.5 text-teal-700" />
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        Located at the bottom of Safari on iPhone or top right on iPad.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        Select &ldquo;Add to Home Screen&rdquo;
                        <PlusSquare className="w-3.5 h-3.5 text-teal-700" />
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        Scroll down the share sheet options to find Add to Home Screen.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Confirm &ldquo;Add&rdquo;</p>
                      <p className="text-slate-500 mt-0.5">
                        Tap Add in the top right corner. The app icon will appear on your home screen.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Android Instructions */}
              {activePlatformTab === 'android' && (
                <div className="flex flex-col gap-3 text-xs text-slate-700">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Open Browser Menu</p>
                      <p className="text-slate-500 mt-0.5">
                        Tap the three dots icon in the top right of Chrome.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Tap &ldquo;Install App&rdquo; or &ldquo;Add to Home screen&rdquo;</p>
                      <p className="text-slate-500 mt-0.5">
                        Follow the on-screen prompt to finish adding to your device.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Instructions */}
              {activePlatformTab === 'desktop' && (
                <div className="flex flex-col gap-3 text-xs text-slate-700">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <Monitor className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Address Bar Install Icon</p>
                      <p className="text-slate-500 mt-0.5">
                        In Chrome, Edge, or Brave, click the install icon at the right edge of the address bar.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-2">
              <Camera className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">1-Tap AI Scanner</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Instant food vision macro calculations.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
              <Dumbbell className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Daily Routines</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Interactive sets &amp; rest timers.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Instant Access</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Launches directly from your home screen.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Zero Distraction</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Fullscreen immersion with no URL bar.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span>{currentOrganization?.name || 'Coach Business Platform'}</span>
          <Link href="/app" className="font-semibold text-teal-700 hover:text-teal-800">
            Open Client Hub &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}
