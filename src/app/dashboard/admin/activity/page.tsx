'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useData } from '@/context/DataContext';
import { Activity, Search, Clock } from 'lucide-react';

export default function SuperAdminActivityPage() {
  const { activityLogs } = useData();
  const [search, setSearch] = useState('');

  const filteredLogs = activityLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Activity & Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time audit trail of administrative actions, coaching assignments, and billing events.
          </p>
        </div>

        <Card className="p-3.5 bg-white shadow-2xs">
          <Input
            placeholder="Search activity logs..."
            leftIcon={<Search className="w-4 h-4 text-teal-700" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Card>

        <Card className="p-0 overflow-hidden bg-white shadow-2xs">
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 shrink-0 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">{log.userName}</span>
                      <Badge variant="info" size="xs">
                        {log.action}
                      </Badge>
                      <Badge variant="default" size="xs">
                        {log.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{log.details}</p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(log.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
