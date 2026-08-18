'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/utils/formatters';
import { Coins, Plus, Users, ShoppingCart, Brain } from 'lucide-react';

export default function CoachAiCreditsPage() {
  const { currentUser } = useAuth();
  const { currentOrganization } = useTenant();
  const {
    coachAccounts,
    memberships,
    users,
    aiTransactions,
    purchaseCoachCredits,
    allocateCreditsToMember,
  } = useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';
  const orgMembers = memberships.filter((m) => m.organizationId === orgId && m.role === 'member');
  const activeCoach = coachAccounts.find((c) => c.userId === currentUser?.id) || coachAccounts[0];

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<'starter' | 'pro' | 'scale'>('pro');

  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(orgMembers[0]?.id || '');
  const [allocateAmount, setAllocateAmount] = useState('500');

  // Transactions for this coach wallet
  const coachTransactions = aiTransactions.filter(
    (t) => t.walletId === `aiw_${activeCoach?.id}` || t.type.includes('coach') || t.type === 'purchase'
  );

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCoach) return;

    const packs = {
      starter: { amount: 1000, cost: 20 },
      pro: { amount: 2500, cost: 45 },
      scale: { amount: 5000, cost: 80 },
    };

    const choice = packs[selectedPack];
    purchaseCoachCredits(activeCoach.id, choice.amount, choice.cost);
    showToast(
      'Credits Purchased',
      `Added +${choice.amount.toLocaleString()} AI credits to your wallet.`,
      'success'
    );
    setIsPurchaseModalOpen(false);
  };

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(allocateAmount, 10);
    if (!activeCoach || !selectedMemberId || isNaN(amount) || amount <= 0) return;

    const res = allocateCreditsToMember(activeCoach.id, selectedMemberId, amount, orgId);
    if (res.success) {
      showToast('Credits Allocated', res.message, 'success');
      setIsAllocateModalOpen(false);
    } else {
      showToast('Allocation Failed', res.message, 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Credit Wallet & Allocations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Purchase credit packs, allocate scanner credits to clients, and review AI token activity.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAllocateModalOpen(true)}
              leftIcon={<Users className="w-4 h-4" />}
            >
              Allocate to Client
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPurchaseModalOpen(true)}
              leftIcon={<ShoppingCart className="w-4 h-4" />}
            >
              Top Up Credits
            </Button>
          </div>
        </div>

        {/* Top 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Available Coach Balance"
            value={`${activeCoach?.aiBalance.toLocaleString()} pts`}
            icon={<Coins className="w-5 h-5 text-amber-600" />}
            subtitle="Ready for AI generators or allocation"
          />
          <StatCard
            title="Allocated to Clients"
            value="1,850 pts"
            icon={<Users className="w-5 h-5 text-teal-700" />}
            subtitle="Distributed to active trainees"
          />
          <StatCard
            title="Consumed by Studio"
            value="1,450 pts"
            icon={<Brain className="w-5 h-5 text-indigo-700" />}
            subtitle="AI workouts & diets generated"
          />
        </div>

        {/* Member Balances Table */}
        <Card className="p-0 overflow-hidden bg-white shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Client AI Scanner Balances
              </h3>
              <p className="text-xs text-slate-500">Credits used by trainees for the AI Food Scanner</p>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setIsAllocateModalOpen(true)}
              leftIcon={<Plus className="w-3 h-3" />}
            >
              Quick Allocate
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Client</th>
                  <th className="py-3.5 px-4">Available Scanner Balance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orgMembers.map((m) => {
                  const u = users.find((usr) => usr.id === m.userId);
                  const isLow = (m.aiCreditBalance || 0) < 50;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                        {u?.name || m.id}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={isLow ? 'text-rose-600' : 'text-amber-700'}>
                          {m.aiCreditBalance || 0} pts
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={isLow ? 'warning' : 'active'} size="xs">
                          {isLow ? 'Low Credits' : 'Good Standing'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            setSelectedMemberId(m.id);
                            setIsAllocateModalOpen(true);
                          }}
                        >
                          + Allocate
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Transaction History */}
        <Card className="p-0 overflow-hidden bg-white shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">AI Transaction History</h3>
            <p className="text-xs text-slate-500">Full ledger of top-ups, deductions, and allocations</p>
          </div>

          <div className="divide-y divide-slate-100">
            {coachTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-semibold text-slate-800">{tx.description}</p>
                  <span className="text-[10px] text-slate-400 font-mono">{formatDate(tx.createdAt)}</span>
                </div>

                <span
                  className={`font-mono font-bold text-xs sm:text-sm ${
                    tx.amount > 0 ? 'text-emerald-700' : 'text-slate-600'
                  }`}
                >
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} pts
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Modal: Top Up Credits */}
        <Modal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          title="Top Up Coach AI Credits"
          description="Select an AI credit pack to replenish your coaching studio inventory."
          maxWidth="md"
        >
          <form onSubmit={handlePurchase} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPack('starter')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedPack === 'starter'
                    ? 'bg-teal-50 border-teal-700 text-teal-900 shadow-2xs ring-1 ring-teal-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block text-slate-900">Starter Pack</span>
                  <span className="text-lg font-extrabold mt-1 block">1,000 pts</span>
                </div>
                <span className="text-xs font-semibold mt-3 text-slate-500">$20.00</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPack('pro')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all relative cursor-pointer ${
                  selectedPack === 'pro'
                    ? 'bg-teal-50 border-teal-700 text-teal-900 shadow-2xs ring-1 ring-teal-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="absolute -top-2.5 right-2">
                  <Badge variant="active" size="xs">
                    Popular
                  </Badge>
                </div>
                <div>
                  <span className="text-xs font-bold block text-slate-900">Pro Pack</span>
                  <span className="text-lg font-extrabold mt-1 block">2,500 pts</span>
                </div>
                <span className="text-xs font-semibold mt-3 text-slate-500">$45.00</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPack('scale')}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedPack === 'scale'
                    ? 'bg-teal-50 border-teal-700 text-teal-900 shadow-2xs ring-1 ring-teal-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block text-slate-900">Scale Pack</span>
                  <span className="text-lg font-extrabold mt-1 block">5,000 pts</span>
                </div>
                <span className="text-xs font-semibold mt-3 text-slate-500">$80.00</span>
              </button>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsPurchaseModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Confirm Simulated Purchase
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Allocate to Member */}
        <Modal
          isOpen={isAllocateModalOpen}
          onClose={() => setIsAllocateModalOpen(false)}
          title="Allocate AI Credits to Client"
          description={`Transfer credits from your available balance (${activeCoach?.aiBalance.toLocaleString()} pts) to a trainee.`}
          maxWidth="sm"
        >
          <form onSubmit={handleAllocate} className="flex flex-col gap-4">
            <Select
              label="Select Client"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              {orgMembers.map((m) => {
                const u = users.find((usr) => usr.id === m.userId);
                return (
                  <option key={m.id} value={m.id}>
                    {u?.name || m.id} (Current: {m.aiCreditBalance || 0} pts)
                  </option>
                );
              })}
            </Select>

            <Input
              label="Credit Amount"
              type="number"
              required
              min="50"
              step="50"
              value={allocateAmount}
              onChange={(e) => setAllocateAmount(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsAllocateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Allocate Credits
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
