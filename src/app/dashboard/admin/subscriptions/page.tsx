'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/utils/formatters';
import { CheckCircle2, Users, Coins } from 'lucide-react';

export default function SuperAdminSubscriptionsPage() {
  const { platformPlans, platformSubscriptions, coachAccounts } = useData();
  const { showToast } = useToast();

  const handleUpdatePlan = (planName: string) => {
    showToast('Plan Tier Updated', `Platform configuration for ${planName} saved.`, 'success');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Subscription Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage commercial SaaS subscription tiers, member limits, and bundled AI allocations for coaches.
          </p>
        </div>

        {/* Pricing Tiers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {platformPlans.map((plan) => {
            const subscribers = coachAccounts.filter((c) => c.platformSubscriptionPlanId === plan.id).length;

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between bg-white shadow-2xs ${
                  plan.recommended ? 'border-teal-700 ring-1 ring-teal-700' : ''
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 right-6">
                    <Badge variant="active" size="xs">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">{plan.name}</h3>
                    <Badge variant="info" size="xs">
                      {subscribers} Coaches Active
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {formatCurrency(plan.priceMonthly)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/ coach / month</span>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-teal-700" />
                      Client Limit:
                    </span>
                    <span className="text-teal-700">{plan.clientLimit} Active Members</span>
                  </div>

                  <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-600" />
                      Monthly AI Credits:
                    </span>
                    <span className="text-amber-700 font-bold">{plan.aiCreditsIncluded.toLocaleString()} pts</span>
                  </div>

                  <div className="mt-5 flex flex-col gap-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Entitlements & Features
                    </p>
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3.5 border-t border-slate-100 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleUpdatePlan(plan.name)}
                  >
                    Configure Plan Parameters
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Active Subscriptions Breakdown */}
        <Card className="bg-white shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Active Coach Platform Subscriptions
              </h3>
              <p className="text-xs text-slate-500">Recurring billing statuses</p>
            </div>
            <Badge variant="active" size="xs">
              {platformSubscriptions.length} Subscriptions Active
            </Badge>
          </div>

          <div className="divide-y divide-slate-100">
            {platformSubscriptions.map((sub) => {
              const coach = coachAccounts.find((c) => c.id === sub.coachAccountId);
              const plan = platformPlans.find((p) => p.id === sub.planId);

              return (
                <div key={sub.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-teal-700">
                      {coach?.name.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{coach?.name || 'Coach'}</p>
                      <p className="text-[11px] text-slate-500">{plan?.name} • {sub.billingCycle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 font-mono">
                      Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </span>
                    <Badge variant={sub.status === 'active' ? 'active' : 'warning'} size="xs">
                      {sub.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
