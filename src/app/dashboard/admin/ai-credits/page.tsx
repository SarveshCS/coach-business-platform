'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { Coins, Plus, Shield, Brain } from 'lucide-react';

export default function SuperAdminAiCreditsPage() {
  const { coachAccounts, aiTransactions, updateCoachAccount } = useData();
  const { showToast } = useToast();

  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState(coachAccounts[0]?.id || '');
  const [grantAmount, setGrantAmount] = useState('1000');

  const totalCoachBalance = coachAccounts.reduce((acc, c) => acc + c.aiBalance, 0);

  const handleGrantCredits = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(grantAmount, 10);
    const targetCoach = coachAccounts.find((c) => c.id === selectedCoachId);

    if (!targetCoach || isNaN(amountNum) || amountNum <= 0) return;

    updateCoachAccount(targetCoach.id, {
      aiBalance: targetCoach.aiBalance + amountNum,
    });

    showToast(
      'AI Credits Minted & Allocated',
      `Super Admin successfully granted +${amountNum.toLocaleString()} AI credits to ${targetCoach.name}.`,
      'success'
    );
    setIsGrantModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform AI Credit Economy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Mint credits, inspect global distribution across coach wallets, and audit AI token consumption.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsGrantModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Mint & Grant AI Credits
          </Button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Circulating Credits"
            value={`${totalCoachBalance.toLocaleString()} pts`}
            icon={<Coins className="w-5 h-5 text-amber-600" />}
            subtitle="Across all coach & member wallets"
          />

          <StatCard
            title="AI Consumption Rate"
            value="~850 pts / day"
            icon={<Brain className="w-5 h-5 text-teal-700" />}
            trend={{ value: '+22% usage', isPositive: true }}
            subtitle="Diet builders, workout generators, and food scans"
          />

          <StatCard
            title="Platform Reserve Pool"
            value="500,000 pts"
            icon={<Shield className="w-5 h-5 text-emerald-700" />}
            subtitle="Available for coach purchases"
          />
        </div>

        {/* Coach Wallets Breakdown */}
        <Card className="bg-white shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Coach Wallet Balances</h3>
            <span className="text-xs text-slate-500">{coachAccounts.length} Coach Wallets</span>
          </div>

          <div className="divide-y divide-slate-100">
            {coachAccounts.map((coach) => (
              <div key={coach.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-teal-700">
                    {coach.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{coach.name}</p>
                    <p className="text-[11px] text-slate-500">{coach.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-amber-700">
                      {coach.aiBalance.toLocaleString()} pts
                    </span>
                    <span className="block text-[10px] text-slate-400">Available Balance</span>
                  </div>

                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      setSelectedCoachId(coach.id);
                      setIsGrantModalOpen(true);
                    }}
                  >
                    Grant +
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Global AI Transactions Ledger */}
        <Card className="p-0 overflow-hidden bg-white shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Global AI Transaction Ledger</h3>
            <p className="text-xs text-slate-500">Auditable log of purchases, allocations, and features consumed</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Description</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aiTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-900">{tx.description}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          tx.type.includes('purchase') || tx.type.includes('in')
                            ? 'active'
                            : 'default'
                        }
                        size="xs"
                      >
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={tx.amount > 0 ? 'text-emerald-700' : 'text-slate-600'}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} pts
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right text-xs text-slate-400 font-mono">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Mint Credits */}
        <Modal
          isOpen={isGrantModalOpen}
          onClose={() => setIsGrantModalOpen(false)}
          title="Mint & Grant AI Credits"
          description="Grant administrative bonus AI credits directly into a coach's platform balance."
          maxWidth="sm"
        >
          <form onSubmit={handleGrantCredits} className="flex flex-col gap-4">
            <Select
              label="Select Coach Account"
              value={selectedCoachId}
              onChange={(e) => setSelectedCoachId(e.target.value)}
            >
              {coachAccounts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </Select>

            <Input
              label="Credit Amount"
              type="number"
              required
              min="100"
              step="100"
              value={grantAmount}
              onChange={(e) => setGrantAmount(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsGrantModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Mint & Deposit
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
