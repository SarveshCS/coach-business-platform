'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  Dumbbell,
  Brain,
  Smartphone,
  Calendar,
  CreditCard,
  Users,
  CheckCircle2,
  ArrowRight,
  Palette,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { switchDemoUser } = useAuth();
  const { showToast } = useToast();

  const handleLaunch = (
    persona: 'coach' | 'admin' | 'member' | 'multi' | 'orphan',
    route: string
  ) => {
    switchDemoUser(persona);
    showToast(`Welcome! Logged in as ${persona.toUpperCase()}`, `Entering ${route}`, 'info');
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-teal-700 selection:text-white">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-xs">
            CO
          </div>
          <div>
            <span className="font-extrabold text-base text-slate-900 tracking-tight">CoachOS</span>
            <span className="text-[10px] text-teal-700 font-bold block -mt-1 uppercase tracking-wider">
              Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleLaunch('coach', '/dashboard')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Launch Coach App
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 py-14 md:py-20 max-w-6xl mx-auto text-center flex flex-col items-center">
        <Badge variant="org" size="md" className="mb-4">
          Multi-Tenant Coaching Business Operating System
        </Badge>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-[1.15]">
          The complete operating system for{' '}
          <span className="text-teal-700">
            modern coaching businesses
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
          Manage organizations, periodized workouts, nutrition protocols, class scheduling with conflict
          prevention, AI credit economy, private community, and mobile trainee PWAs.
        </p>

        {/* 3 Main Experience Portals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12 text-left">
          {/* Coach Management */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-5 border border-teal-100">
                <Dumbbell className="w-5 h-5" />
              </div>
              <Badge variant="default" size="xs" className="mb-2">
                Desktop Management
              </Badge>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Coach Management OS</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Full 360° member workspace, AI workout & diet generation, interactive calendar with coach conflict validation, and subscription management.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => handleLaunch('coach', '/dashboard')}
              className="mt-6 w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Coach Dashboard
            </Button>
          </div>

          {/* Client PWA */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 border border-emerald-100">
                <Smartphone className="w-5 h-5" />
              </div>
              <Badge variant="success" size="xs" className="mb-2">
                Mobile-First PWA
              </Badge>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Client Trainee App</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Mobile app with workout tracking, daily meal plan, AI food nutrition photo scanner, class bookings, and private community feed.
              </p>
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={() => handleLaunch('member', '/app')}
              className="mt-6 w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Client PWA
            </Button>
          </div>

          {/* Super Admin */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-5 border border-indigo-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <Badge variant="info" size="xs" className="mb-2">
                Platform Admin
              </Badge>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Super Admin Portal</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Platform-wide control over coaches, organizations, platform subscription tiers, global AI inventory, and comprehensive audit logs.
              </p>
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={() => handleLaunch('admin', '/dashboard/admin')}
              className="mt-6 w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Super Admin
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 w-full text-left">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 text-center mb-8">
            Engineered with Production-Grade Business Logic
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <Brain className="w-5 h-5 text-teal-700 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">AI Credit Economy</h4>
              <p className="text-xs text-slate-500 mt-1">
                Platform → Coach Wallet → Member Wallet hierarchy. Deducts credits on AI workouts, diets, and food scans.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <Calendar className="w-5 h-5 text-teal-700 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">Conflict Detection Engine</h4>
              <p className="text-xs text-slate-500 mt-1">
                Real-time validation prevents scheduling overlapping sessions for the same coach on the calendar.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <Users className="w-5 h-5 text-teal-700 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">Multi-Tenant Identity</h4>
              <p className="text-xs text-slate-500 mt-1">
                Global user identity is decoupled from organization memberships. Supports multi-org switching and orphan states.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <Palette className="w-5 h-5 text-teal-700 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">Dynamic Org Branding</h4>
              <p className="text-xs text-slate-500 mt-1">
                Organizations customize their own primary & secondary colors, dynamically reflected throughout client PWAs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <CreditCard className="w-5 h-5 text-teal-700 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">Coaching Subscriptions & Billing</h4>
              <p className="text-xs text-slate-500 mt-1">
                Track renewal alerts, active member plans, paid/pending invoices, and financial reports.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-teal-700 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">Interactive Community Moderation</h4>
              <p className="text-xs text-slate-500 mt-1">
                Private org feed with likes, comments, announcements, and separate community ban permissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 lg:px-12 text-center text-xs text-slate-500">
        <p>Coach Business Platform (CoachOS) • Next.js 16 & React 19</p>
      </footer>
    </div>
  );
}
