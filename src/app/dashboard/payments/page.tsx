'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { LineChart } from '@/components/ui/SvgChart';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Payment } from '@/types';
import { DollarSign, CreditCard, Download, Clock, Eye } from 'lucide-react';

export default function CoachPaymentsPage() {
  const { currentOrganization } = useTenant();
  const { payments } = useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';
  const orgPayments = payments.filter((p) => p.organizationId === orgId);

  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);

  const totalCollected = orgPayments
    .filter((p) => p.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingAmount = orgPayments
    .filter((p) => p.status === 'pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const revenueTrend = [
    { label: 'W1', value: 850 },
    { label: 'W2', value: 1120 },
    { label: 'W3', value: 1340 },
    { label: 'W4', value: 1690 },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Payments & Financial Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track client subscription payments, invoices, payment methods, and net earnings.
          </p>
        </div>

        {/* Top Financial Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Revenue Collected"
            value={formatCurrency(totalCollected)}
            icon={<DollarSign className="w-5 h-5 text-emerald-700" />}
            trend={{ value: '+18.4% growth', isPositive: true }}
          />
          <StatCard
            title="Pending Invoices"
            value={formatCurrency(pendingAmount)}
            icon={<Clock className="w-5 h-5 text-amber-700" />}
            subtitle="Due in next 7 days"
          />
          <StatCard
            title="Avg. Client LTV"
            value="$480"
            icon={<CreditCard className="w-5 h-5 text-teal-700" />}
            subtitle="Based on 4.2 mo retention"
          />
        </div>

        {/* Revenue Trendline */}
        <Card className="bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Revenue Trajectory ($)</h3>
              <p className="text-xs text-slate-500">Weekly coaching payments</p>
            </div>
            <Badge variant="success" size="xs">
              All Payments Settled
            </Badge>
          </div>
          <LineChart data={revenueTrend} color="#0f766e" height={150} valuePrefix="$" />
        </Card>

        {/* Invoices Table */}
        <Card className="p-0 overflow-hidden bg-white shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Payment Invoices & Receipts</h3>
            <span className="text-xs text-slate-500">{orgPayments.length} Invoices</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Invoice #</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orgPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-teal-700">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{p.memberName}</p>
                      <p className="text-[11px] text-slate-500">{p.memberEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{p.description}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{formatCurrency(p.amount)}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={p.status === 'paid' ? 'active' : 'warning'} size="xs">
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setSelectedInvoice(p)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        View Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Invoice View Modal */}
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice?.invoiceNumber}`}
          description={`Payment Record for ${currentOrganization?.name}`}
          maxWidth="sm"
        >
          {selectedInvoice && (
            <div className="flex flex-col gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Billed To:</span>
                  <span className="font-bold text-slate-900">{selectedInvoice.memberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-mono text-slate-700">{formatDate(selectedInvoice.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="text-slate-700">{selectedInvoice.paymentMethod}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
                  <span className="text-slate-700">Total Paid:</span>
                  <span className="text-emerald-700">{formatCurrency(selectedInvoice.amount)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    showToast('Receipt Downloaded', 'PDF invoice receipt generated.', 'success');
                    setSelectedInvoice(null);
                  }}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
