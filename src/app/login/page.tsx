'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Dumbbell, User, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoUser } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('coach@demo.com');
  const [password, setPassword] = useState('coach123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);

      if (res.success) {
        showToast('Signed in successfully', `Welcome back`, 'success');
        if (email.toLowerCase().includes('admin')) {
          router.push('/dashboard/admin');
        } else if (email.toLowerCase().includes('coach') || email.toLowerCase().includes('neha') || email.toLowerCase().includes('vikram')) {
          router.push('/dashboard');
        } else {
          router.push('/app');
        }
      } else {
        setError(res.message || 'Invalid credentials.');
      }
    }, 400);
  };

  const handleQuickLogin = (
    persona: 'admin' | 'coach' | 'member' | 'multi' | 'orphan' | 'banned',
    targetRoute: string,
    demoEmail: string,
    demoPass: string
  ) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    switchDemoUser(persona);
    showToast(`Logged in as ${persona.toUpperCase()}`, `Routing to ${targetRoute}`, 'info');
    router.push(targetRoute);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            CO
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-teal-700 transition-colors">
              CoachOS
            </h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Business Operating System
            </p>
          </div>
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Sign in to your platform
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Select a demo persona or enter account credentials.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4">
        {/* Quick Demo Personas Selector Box */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 mb-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Instant Demo Access
            </p>
            <Badge variant="default" size="xs">
              Simulated Environment
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('coach', '/dashboard', 'coach@demo.com', 'coach123')}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group cursor-pointer"
            >
              <div className="p-2 rounded-md bg-teal-50 text-teal-700 border border-teal-100 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Coach Account</p>
                <p className="text-[10px] text-slate-500 truncate">coach@demo.com</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin', '/dashboard/admin', 'admin@demo.com', 'admin123')}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group cursor-pointer"
            >
              <div className="p-2 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 group-hover:bg-indigo-700 group-hover:text-white transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Super Admin</p>
                <p className="text-[10px] text-slate-500 truncate">admin@demo.com</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('member', '/app', 'member@demo.com', 'member123')}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group cursor-pointer"
            >
              <div className="p-2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Member (1 Org)</p>
                <p className="text-[10px] text-slate-500 truncate">member@demo.com</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('multi', '/app', 'multi@demo.com', 'multi123')}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group cursor-pointer"
            >
              <div className="p-2 rounded-md bg-amber-50 text-amber-700 border border-amber-100 group-hover:bg-amber-700 group-hover:text-white transition-colors">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Multi-Org Member</p>
                <p className="text-[10px] text-slate-500 truncate">multi@demo.com</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('orphan', '/app', 'orphan@demo.com', 'orphan123')}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group col-span-1 sm:col-span-2 cursor-pointer"
            >
              <div className="p-2 rounded-md bg-rose-50 text-rose-700 border border-rose-100 group-hover:bg-rose-700 group-hover:text-white transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Restricted User (0 Memberships)</p>
                <p className="text-[10px] text-slate-500 truncate">orphan@demo.com</p>
              </div>
            </button>
          </div>
        </div>

        {/* Traditional Credentials Form */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. coach@demo.com"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          CoachOS Multi-Tenant Architecture Demonstration
        </div>
      </div>
    </div>
  );
}
