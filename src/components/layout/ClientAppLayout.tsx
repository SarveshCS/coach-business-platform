'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import {
  Home,
  Calendar,
  Dumbbell,
  Apple,
  Users,
  Bell,
  ScanLine,
  MessageSquare,
  ChevronDown,
  LogOut,
  CheckCircle2,
  Lock,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStandaloneGuard } from '@/hooks/useStandaloneGuard';
import { usePwaInstall } from '@/hooks/usePwaInstall';

export const ClientAppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useStandaloneGuard();
  const { isStandalone } = usePwaInstall();
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, userMemberships, logout } = useAuth();
  const { currentOrganization, currentMembership, availableOrganizations, switchOrganization } =
    useTenant();
  const { messages, notifications } = useData();

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Unread messages & notifications
  const unreadMsgCount = messages.filter(
    (m) =>
      m.organizationId === currentOrganization?.id &&
      m.receiverUserId === currentUser?.id &&
      !m.isRead
  ).length;

  const unreadNotifCount = notifications.filter(
    (n) => n.userId === currentUser?.id && !n.isRead
  ).length;

  // Zero-membership check rule
  if (userMemberships.length === 0 && pathname !== '/app/restricted') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
          <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">No Active Organization</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
            Your global account <span className="text-teal-700 font-semibold">{currentUser?.email}</span> exists, but is not currently enrolled in an active coaching organization.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Switch Demo Account
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const navTabs = [
    { name: 'Home', href: '/app', icon: Home },
    { name: 'Schedule', href: '/app/schedule', icon: Calendar },
    { name: 'Workouts', href: '/app/workouts', icon: Dumbbell },
    { name: 'Diet', href: '/app/diet', icon: Apple },
    { name: 'Community', href: '/app/community', icon: Users },
  ];

  const primaryColor = currentOrganization?.branding.primaryColor || '#0f766e';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-24 md:pb-0">
      {/* Mobile-first Compact Top Header */}
      <header className="sticky top-0 z-40 h-14 bg-white/95 border-b border-slate-200/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        {/* Org Identity - Clean & Borderless with Chevron */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
            className="flex items-center gap-2 py-1 px-1.5 -ml-1.5 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer group"
          >
            <span className="w-6 h-6 rounded-md bg-teal-700 text-white text-[11px] font-bold flex items-center justify-center shadow-2xs shrink-0">
              {currentOrganization?.name.slice(0, 2).toUpperCase() || 'CO'}
            </span>
            <span className="font-bold text-sm text-slate-900 truncate max-w-[140px] sm:max-w-[220px]">
              {currentOrganization?.name || 'Rahul Fitness Hub'}
            </span>
            {availableOrganizations.length > 1 && (
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0" />
            )}
          </button>

          {/* Org Switcher for multi-membership members */}
          {orgDropdownOpen && availableOrganizations.length > 1 && (
            <div className="absolute left-0 top-11 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Switch Organization
              </p>
              {availableOrganizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    switchOrganization(org.id);
                    setOrgDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                    org.id === currentOrganization?.id
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                      {org.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate">{org.name}</span>
                  </div>
                  {org.id === currentOrganization?.id && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right action icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Install App Shortcut */}
          {!isStandalone && (
            <Link
              href="/app/install"
              className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
              title="Install Client App on Device"
              aria-label="Install Client App"
            >
              <Download className="w-4 h-4 text-teal-700" />
              <span className="hidden sm:inline text-xs font-bold text-teal-700">Install</span>
            </Link>
          )}

          {/* Coach Library Shortcut */}
          <Link
            href="/app/coach"
            className="p-2 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-slate-100 transition-colors"
            title="Coach Video & Content Library"
            aria-label="Coach Content"
          >
            <span className="text-xs font-bold text-teal-700 px-2 py-0.5 rounded bg-teal-50 border border-teal-200">
              Media
            </span>
          </Link>

          {/* Messages */}
          <Link
            href="/app/messages"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Direct Messages"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadMsgCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </Link>

          {/* Notifications */}
          <Link
            href="/app/notifications"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-600" />
            )}
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-lg mx-auto w-full p-4 sm:p-5 pb-24 md:pb-6">
        {children}
      </main>

      {/* Mobile-first Modern 5-Item Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 border-t border-slate-200/90 backdrop-blur-lg px-2 py-1 flex items-center justify-around max-w-lg mx-auto md:rounded-t-2xl shadow-xl">
        {/* Tab 1: Home */}
        <Link
          href="/app"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 cursor-pointer ${
            pathname === '/app'
              ? 'text-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 ${pathname === '/app' ? 'text-teal-700' : 'text-slate-400'}`} />
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* Tab 2: Consolidated Plan (Workouts & Diet) */}
        <Link
          href="/app/plan"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 cursor-pointer ${
            pathname === '/app/plan' || pathname.startsWith('/app/plan') || pathname === '/app/workouts' || pathname.startsWith('/app/workouts') || pathname === '/app/diet' || pathname.startsWith('/app/diet')
              ? 'text-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Dumbbell className={`w-5 h-5 mb-0.5 ${pathname === '/app/plan' || pathname.startsWith('/app/plan') || pathname === '/app/workouts' || pathname.startsWith('/app/workouts') || pathname === '/app/diet' || pathname.startsWith('/app/diet') ? 'text-teal-700' : 'text-slate-400'}`} />
          <span className="text-[10px] tracking-tight">Plan</span>
        </Link>

        {/* Tab 3: Center Elevated Hero Action Button (1-Tap AI Food Scanner) */}
        <div className="flex-1 flex justify-center">
          <Link
            href="/app/ai"
            className="flex flex-col items-center justify-center -mt-6 group cursor-pointer"
            title="Scan Food with AI"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform group-active:scale-95 group-hover:scale-105 ${
                pathname === '/app/ai' || pathname.startsWith('/app/ai/')
                  ? 'bg-teal-800 text-white ring-4 ring-teal-100 shadow-teal-900/30'
                  : 'bg-teal-700 hover:bg-teal-800 text-white ring-4 ring-slate-50 shadow-teal-900/20'
              }`}
            >
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <span
              className={`text-[10px] font-bold mt-1 tracking-tight ${
                pathname === '/app/ai' || pathname.startsWith('/app/ai/')
                  ? 'text-teal-800'
                  : 'text-slate-600 group-hover:text-slate-900'
              }`}
            >
              Scan
            </span>
          </Link>
        </div>

        {/* Tab 4: Community */}
        <Link
          href="/app/community"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 cursor-pointer ${
            pathname === '/app/community' || pathname.startsWith('/app/community/')
              ? 'text-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className={`w-5 h-5 mb-0.5 ${pathname === '/app/community' || pathname.startsWith('/app/community/') ? 'text-teal-700' : 'text-slate-400'}`} />
          <span className="text-[10px] tracking-tight">Community</span>
        </Link>

        {/* Tab 5: You (Profile - Discord style) */}
        <Link
          href="/app/profile"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 cursor-pointer ${
            pathname === '/app/profile' || pathname.startsWith('/app/profile/') || pathname === '/app/subscription' || pathname === '/app/progress'
              ? 'text-teal-800 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full overflow-hidden flex items-center justify-center mb-0.5 transition-all ${
              pathname === '/app/profile' || pathname.startsWith('/app/profile/') || pathname === '/app/subscription' || pathname === '/app/progress'
                ? 'ring-2 ring-teal-700 ring-offset-1 bg-teal-700 text-white'
                : 'border border-slate-300 bg-slate-100 text-slate-600'
            }`}
          >
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold">
                {currentUser?.name.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">You</span>
        </Link>
      </nav>
    </div>
  );
};
