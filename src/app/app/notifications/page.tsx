'use client';

import React from 'react';
import { ClientAppLayout } from '@/components/layout/ClientAppLayout';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { formatDate } from '@/utils/formatters';
import { Bell, Dumbbell, Apple, Calendar, Coins } from 'lucide-react';

export default function ClientNotificationsPage() {
  const { currentUser } = useAuth();
  const { notifications, markNotificationRead } = useData();

  const userNotifs = notifications.filter((n) => n.userId === currentUser?.id);

  const getIcon = (category: string) => {
    switch (category) {
      case 'workout':
        return <Dumbbell className="w-4 h-4 text-teal-700" />;
      case 'diet':
        return <Apple className="w-4 h-4 text-emerald-700" />;
      case 'class':
        return <Calendar className="w-4 h-4 text-indigo-700" />;
      case 'ai':
        return <Coins className="w-4 h-4 text-amber-700" />;
      default:
        return <Bell className="w-4 h-4 text-teal-700" />;
    }
  };

  return (
    <ClientAppLayout>
      <div className="flex flex-col gap-5 pb-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">Workout updates, class reminders, and messages.</p>
        </div>

        <Card className="p-0 overflow-hidden bg-white shadow-2xs">
          <div className="divide-y divide-slate-100">
            {userNotifs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No notifications yet.</div>
            ) : (
              userNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                    !n.isRead ? 'bg-teal-50/50 hover:bg-teal-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                    {getIcon(n.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-teal-700 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </ClientAppLayout>
  );
}
