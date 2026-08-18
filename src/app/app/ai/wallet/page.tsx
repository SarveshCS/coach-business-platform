'use client';

import React from 'react';
import Link from 'next/link';
import { ClientAppLayout } from '@/components/layout/ClientAppLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { formatDate } from '@/utils/formatters';
import { Coins, ArrowLeft } from 'lucide-react';

export default function ClientAiWalletPage() {
  const { currentMembership } = useTenant();
  const { aiTransactions } = useData();

  const memId = currentMembership?.id;
  const balance = currentMembership?.aiCreditBalance || 0;

  const memberTransactions = aiTransactions.filter(
    (t) => t.walletId === `aiw_${memId}` || t.walletId === memId
  );

  return (
    <ClientAppLayout>
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/app/ai">
            <Button variant="outline" size="xs" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Scanner
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Scanner Balance</h1>
            <p className="text-xs text-slate-500 mt-0.5">Personal food scanner credit allocation</p>
          </div>
        </div>

        <StatCard
          title="Your AI Credit Balance"
          value={`${balance} pts`}
          icon={<Coins className="w-5 h-5 text-amber-600" />}
          subtitle={`${Math.floor(balance / 50)} food vision scans available (50 pts / scan)`}
        />

        <Card className="p-4 bg-teal-50/80 border border-teal-200 text-xs text-teal-900 leading-relaxed shadow-2xs">
          <p className="font-bold text-teal-950 mb-1">How do athlete AI credits work?</p>
          <p>
            Your coach grants AI credits directly to your account to power real-time AI food & macro scanning.
            As an athlete, you consume credits per scan. Credits cannot be transferred between members. Need more credits? Contact your coach.
          </p>
        </Card>

        {/* Transaction History */}
        <Card className="p-0 overflow-hidden bg-white shadow-2xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Personal Credit Activity</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {memberTransactions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No personal credit activity recorded yet.
              </div>
            ) : (
              memberTransactions.map((tx) => (
                <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900">{tx.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{formatDate(tx.createdAt)}</span>
                  </div>
                  <span
                    className={`font-mono font-bold ${
                      tx.amount > 0 ? 'text-emerald-700' : 'text-slate-600'
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} pts
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </ClientAppLayout>
  );
}
