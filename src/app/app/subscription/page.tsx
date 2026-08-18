'use client';

import React from 'react';
import { ClientAppLayout } from '@/components/layout/ClientAppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Download } from 'lucide-react';

export default function ClientSubscriptionPage() {
  const { currentOrganization, currentMembership } = useTenant();
  const { coachingSubscriptions, coachingPlans, payments } = useData();
  const { showToast } = useToast();

  const memId = currentMembership?.id;
  const sub = coachingSubscriptions.find((s) => s.memberId === memId);
  const plan = coachingPlans.find((p) => p.id === sub?.planId);
  const memberPayments = payments.filter((p) => p.memberId === memId);

  return (
    <ClientAppLayout>
      <div className="flex flex-col gap-5 pb-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Coaching Membership & Billing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your active coaching package in {currentOrganization?.name}.
          </p>
        </div>

        {/* Current Plan Card */}
        {sub ? (
          <Card className="flex flex-col justify-between p-5 bg-white border-teal-700/50 shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="info" size="xs">
                  Active Package
                </Badge>
                <Badge variant={sub.status === 'expiring_soon' ? 'warning' : 'active'} size="xs">
                  {sub.status}
                </Badge>
              </div>

              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{plan?.name}</h2>
              <p className="text-xs text-slate-500 mt-1">{plan?.description}</p>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  {formatCurrency(sub.price)}
                </span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <span className="text-slate-500">Next Auto-Renewal:</span>
                <span className="font-bold text-slate-900 font-mono">{formatDate(sub.renewalDate)}</span>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-8 text-center text-xs text-slate-500 bg-white">
            No active coaching subscription.
          </Card>
        )}

        {/* Invoices List */}
        <Card className="p-0 overflow-hidden bg-white shadow-2xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900">Payment Receipts</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {memberPayments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No payment receipts yet.</div>
            ) : (
              memberPayments.map((p) => (
                <div key={p.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 font-mono">{p.invoiceNumber}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">{p.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{formatDate(p.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-700 font-mono">
                      {formatCurrency(p.amount)}
                    </span>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => showToast('Receipt Downloaded', 'PDF receipt saved.', 'success')}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
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
