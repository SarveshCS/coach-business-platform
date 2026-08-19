'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { Badge } from '@/components/ui/Badge';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Apple,
  Calendar,
  CreditCard,
  DollarSign,
  MessageSquare,
  Brain,
  BarChart3,
  Building2,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Coins,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  ArrowRightLeft,
  Briefcase,
  CheckCircle2,
  Video,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  pill?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

import { useStandaloneGuard } from '@/hooks/useStandaloneGuard';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useStandaloneGuard();
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, globalRole, logout } = useAuth();
  const { currentOrganization, availableOrganizations, switchOrganization } = useTenant();
  const { coachAccounts, messages, notifications, markAllNotificationsRead, markNotificationRead } = useData();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);

  // Unread messages for this user in current org
  const unreadMessageCount = messages.filter(
    (m) =>
      m.organizationId === currentOrganization?.id &&
      m.receiverUserId === currentUser?.id &&
      !m.isRead
  ).length;

  // Unread notifications
  const userNotifications = notifications.filter(
    (n) => n.userId === currentUser?.id || (!n.userId && n.organizationId === currentOrganization?.id)
  );
  const unreadNotifs = userNotifications.filter((n) => !n.isRead);

  // Coach AI balance
  const activeCoachAccount = coachAccounts.find((c) => c.userId === currentUser?.id) || coachAccounts[0];

  const isSuperAdmin = globalRole === 'super_admin';

  // Navigation Items
  const superAdminNav: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Platform',
      items: [
        { name: 'Coaches', href: '/dashboard/admin/coaches', icon: ShieldCheck },
        { name: 'Organizations', href: '/dashboard/admin/organizations', icon: Building2 },
        { name: 'Global Users', href: '/dashboard/admin/users', icon: Users },
        { name: 'Subscriptions', href: '/dashboard/admin/subscriptions', icon: Layers },
        { name: 'AI Credits Pool', href: '/dashboard/admin/ai-credits', icon: Coins },
      ],
    },
    {
      group: 'Operations',
      items: [
        { name: 'Activity / Audit', href: '/dashboard/admin/activity', icon: Activity },
        { name: 'Platform Reports', href: '/dashboard/admin/reports', icon: BarChart3 },
      ],
    },
  ];

  const coachNav: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Members',
      items: [
        { name: 'All Members', href: '/dashboard/members', icon: Users },
      ],
    },
    {
      group: 'Coaching',
      items: [
        { name: 'Workouts', href: '/dashboard/workouts', icon: Dumbbell },
        { name: 'Diets & Nutrition', href: '/dashboard/diets', icon: Apple },
        { name: 'Progress & Metrics', href: '/dashboard/progress', icon: TrendingUp },
        { name: 'Schedule & Classes', href: '/dashboard/schedule', icon: Calendar },
      ],
    },
    {
      group: 'Business',
      items: [
        { name: 'Services', href: '/dashboard/services', icon: Briefcase },
        { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: CreditCard },
        { name: 'Payments & Revenue', href: '/dashboard/payments', icon: DollarSign },
      ],
    },
    {
      group: 'Engagement',
      items: [
        {
          name: 'Messages',
          href: '/dashboard/messages',
          icon: MessageSquare,
          badge: unreadMessageCount > 0 ? unreadMessageCount : undefined,
        },
        { name: 'Community Feed', href: '/dashboard/community', icon: Building2 },
        { name: 'Coach Content', href: '/dashboard/content', icon: Video },
      ],
    },
    {
      group: 'AI Tools',
      items: [
        { name: 'AI Studio', href: '/dashboard/ai', icon: Brain },
        {
          name: 'AI Credits Wallet',
          href: '/dashboard/ai/credits',
          icon: Coins,
          pill: `${activeCoachAccount?.aiBalance?.toLocaleString() || 0} pts`,
        },
      ],
    },
    {
      group: 'Settings',
      items: [
        { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
        { name: 'Organization Branding', href: '/dashboard/organization', icon: Building2 },
      ],
    },
  ];

  const navGroups = isSuperAdmin ? superAdminNav : coachNav;

  const isNavItemActive = (itemHref: string) => {
    if (pathname === itemHref) return true;
    if (itemHref === '/dashboard' || itemHref === '/dashboard/admin' || itemHref === '/dashboard/ai') {
      return false;
    }
    if (itemHref === '/dashboard/schedule' && pathname.startsWith('/dashboard/classes')) {
      return true;
    }
    return pathname.startsWith(`${itemHref}/`);
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <header className="shrink-0 h-16 bg-white border-b border-slate-200/90 px-4 lg:px-8 flex items-center justify-between z-40">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-xs">
              CO
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                CoachOS
              </span>
              <span className="text-[10px] text-slate-500 block -mt-1 font-semibold uppercase tracking-wider">
                {isSuperAdmin ? 'Super Admin' : 'Operating System'}
              </span>
            </div>
          </Link>
        </div>

        {/* Center/Right: Org selector + AI Balance + Notifs + Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Org Selector (if not Super Admin) */}
          {!isSuperAdmin && (
            <div className="relative">
              <button
                onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentOrganization?.branding.primaryColor || '#0f766e' }} />
                <span className="truncate max-w-[120px] sm:max-w-[180px]">
                  {currentOrganization?.name || 'Rahul Fitness Hub'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {orgDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Select Organization
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
          )}

          {/* AI Credits Pill (Coach Scope) */}
          {!isSuperAdmin && activeCoachAccount && (
            <Link
              href="/dashboard/ai/credits"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-semibold font-mono transition-colors shadow-2xs cursor-pointer"
              title="AI Wallet Balance"
            >
              <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="hidden sm:inline">AI Credits:</span>
              <span className="font-bold">{activeCoachAccount.aiBalance.toLocaleString()}</span>
            </Link>
          )}

          {/* Super Admin MRR pill */}
          {isSuperAdmin && (
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold font-mono">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Platform Active</span>
            </div>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors cursor-pointer"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-2">
                  <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {unreadNotifs.length} new
                  </span>
                </div>
                <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                  {unreadNotifs.length === 0 ? (
                    <p className="text-xs text-slate-400 p-4 text-center">No new notifications</p>
                  ) : (
                    unreadNotifs.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className="p-2 rounded-lg hover:bg-slate-50 text-xs cursor-pointer transition-colors"
                      >
                        <p className="font-semibold text-slate-800">{n.title}</p>
                        <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs text-teal-700">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser?.name?.charAt(0) || 'U'
              )}
            </div>

            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area (Fixed Sidebar + Independent Content Scrolling) */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Persistent Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col h-full bg-white border-r border-slate-200 shrink-0 overflow-hidden select-none">
          {/* Scrollable Nav Area */}
          <div className="p-3.5 flex-1 min-h-0 overflow-y-auto flex flex-col gap-5">
            {navGroups.map((group, idx) => (
              <div key={idx} className="flex flex-col gap-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
                  {group.group}
                </p>
                {group.items.map((item) => {
                  const isActive = isNavItemActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-teal-50 text-teal-900 border-l-2 border-teal-700 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {item.pill && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                          {item.pill}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50/70 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{globalRole?.replace('_', ' ')}</p>
              </div>
            </div>
            <Badge variant={isSuperAdmin ? 'active' : 'default'} size="xs">
              {isSuperAdmin ? 'Admin' : 'Pro Tier'}
            </Badge>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 bg-white border-r border-slate-200 flex flex-col justify-between p-4 z-10 animate-in slide-in-from-left duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-teal-700 flex items-center justify-center text-white font-bold text-xs">
                    CO
                  </div>
                  <span className="font-bold text-slate-900">CoachOS</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-5">
                {navGroups.map((group, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
                      {group.group}
                    </p>
                    {group.items.map((item) => {
                      const isActive = isNavItemActive(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                            isActive
                              ? 'bg-teal-50 text-teal-900 font-bold border-l-2 border-teal-700'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
                <Link
                  href="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-xs font-semibold text-slate-800 hover:bg-slate-200 transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                  <span>Open Client App</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Workspace (independently scrollable) */}
        <main className="flex-1 min-h-0 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/70 min-w-0">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
