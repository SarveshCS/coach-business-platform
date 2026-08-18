'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Users, Plus, AlertCircle, DollarSign } from 'lucide-react';

export default function CoachSubscriptionsPage() {
  const { currentOrganization } = useTenant();
  const { coachingPlans, coachingSubscriptions, memberships, users, addCoachingPlan } = useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';
  const orgPlans = coachingPlans.filter((p) => p.organizationId === orgId);
  const orgSubs = coachingSubscriptions.filter((s) => s.organizationId === orgId);

  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [planPrice, setPlanPrice] = useState(199);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName) return;

    addCoachingPlan({
      organizationId: orgId,
      name: planName,
      description: planDesc,
      price: planPrice,
      billingCycle,
      durationMonths: billingCycle === 'annual' ? 12 : billingCycle === 'quarterly' ? 3 : 1,
      includedServices: [],
      status: 'active',
    });

    showToast('Plan Created', `Added ${planName} coaching plan.`, 'success');
    setIsAddPlanOpen(false);
    setPlanName('');
    setPlanDesc('');
  };

  const totalMonthlyRecur = orgSubs
    .filter((s) => s.status === 'active' || s.status === 'expiring_soon')
    .reduce((acc, s) => acc + s.price, 0);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Coaching Subscriptions & Packages
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Recurring client subscriptions, member renewal schedules, and package plans.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddPlanOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Plan Package
          </Button>
        </div>

        {/* Top 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Monthly Client Subscriptions"
            value={formatCurrency(totalMonthlyRecur)}
            icon={<DollarSign className="w-5 h-5 text-emerald-700" />}
            trend={{ value: '+14% MoM', isPositive: true }}
          />
          <StatCard
            title="Active Subscribers"
            value={orgSubs.length}
            icon={<Users className="w-5 h-5 text-teal-700" />}
            subtitle="Enrolled in recurring coaching"
          />
          <StatCard
            title="Expiring Within 7 Days"
            value={orgSubs.filter((s) => s.status === 'expiring_soon').length}
            icon={<AlertCircle className="w-5 h-5 text-amber-700" />}
            subtitle="Renewal reminders sent"
          />
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {orgPlans.map((plan) => {
            const subscribers = orgSubs.filter((s) => s.planId === plan.id).length;
            return (
              <Card key={plan.id} className="flex flex-col justify-between bg-white border-slate-200 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">{plan.name}</h3>
                    <Badge variant="info" size="xs">
                      {subscribers} Subscribers
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-xs text-slate-500">/ {plan.billingCycle}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Active Subscribers Table */}
        <Card className="p-0 overflow-hidden bg-white shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Active Client Subscribers</h3>
            <p className="text-xs text-slate-500">Renewal timeline and auto-renew status</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Client</th>
                  <th className="py-3.5 px-4">Plan Name</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Renewal Date</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orgSubs.map((sub) => {
                  const mem = memberships.find((m) => m.id === sub.memberId);
                  const user = users.find((u) => u.id === mem?.userId);
                  const plan = orgPlans.find((p) => p.id === sub.planId);

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                        {user?.name || 'Client'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{plan?.name || 'Coaching Plan'}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(sub.price)}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{formatDate(sub.renewalDate)}</td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={sub.status === 'expiring_soon' ? 'warning' : 'active'}
                          size="xs"
                        >
                          {sub.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Create Plan */}
        <Modal
          isOpen={isAddPlanOpen}
          onClose={() => setIsAddPlanOpen(false)}
          title="Create Coaching Subscription Package"
          description="Define pricing and billing cycle for client coaching plans."
          maxWidth="sm"
        >
          <form onSubmit={handleCreatePlan} className="flex flex-col gap-4">
            <Input
              label="Plan Name"
              required
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g. Elite 1-on-1 Recomp Package"
            />
            <Input
              label="Description"
              value={planDesc}
              onChange={(e) => setPlanDesc(e.target.value)}
              placeholder="Full nutrition, workouts, and weekly form audits"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price ($)"
                type="number"
                value={planPrice}
                onChange={(e) => setPlanPrice(parseInt(e.target.value, 10))}
              />
              <Select
                label="Billing Cycle"
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as any)}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly (3 Mo)</option>
                <option value="annual">Annual (12 Mo)</option>
              </Select>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddPlanOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Plan Package
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
