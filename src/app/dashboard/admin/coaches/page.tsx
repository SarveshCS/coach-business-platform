'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { CoachAccount } from '@/types';
import {
  Search,
  Plus,
  Coins,
} from 'lucide-react';

export default function SuperAdminCoachesPage() {
  const { coachAccounts, organizations, updateCoachAccount, platformPlans } =
    useData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedCoach, setSelectedCoach] = useState<CoachAccount | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New coach form state
  const [newCoachName, setNewCoachName] = useState('');
  const [newCoachEmail, setNewCoachEmail] = useState('');
  const [newCoachSpecialty, setNewCoachSpecialty] = useState('');
  const [newCoachOrgName, setNewCoachOrgName] = useState('');
  const [newCoachPlan, setNewCoachPlan] = useState('plan_pro');

  const filteredCoaches = useMemo(() => {
    return coachAccounts.filter((coach) => {
      const matchesSearch =
        coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (coach.specialty && coach.specialty.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || coach.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [coachAccounts, searchQuery, statusFilter]);

  const handleToggleStatus = (coach: CoachAccount) => {
    const nextStatus = coach.status === 'active' ? 'suspended' : 'active';
    updateCoachAccount(coach.id, { status: nextStatus });
    showToast(
      `Coach ${nextStatus === 'active' ? 'Restored' : 'Suspended'}`,
      `${coach.name}'s account status changed to ${nextStatus}.`,
      nextStatus === 'active' ? 'success' : 'warning'
    );
    if (selectedCoach && selectedCoach.id === coach.id) {
      setSelectedCoach({ ...selectedCoach, status: nextStatus });
    }
  };

  const handleCreateCoach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoachName || !newCoachEmail) return;

    // Simulate coach registration
    showToast('Coach Account Provisioned', `${newCoachName} was added to the platform.`, 'success');
    setIsAddModalOpen(false);
    setNewCoachName('');
    setNewCoachEmail('');
    setNewCoachSpecialty('');
    setNewCoachOrgName('');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Coach Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Inspect, suspend, or configure coach accounts across all organizations.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Provision Coach
          </Button>
        </div>

        {/* Filters & Search */}
        <Card className="p-3.5 bg-white shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1">
              <Input
                placeholder="Search coaches by name, email, specialty..."
                leftIcon={<Search className="w-4 h-4 text-teal-700" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Coach Table */}
        <Card className="p-0 overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Coach Name & Specialty</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Organizations</th>
                  <th className="py-3.5 px-4">Platform Tier</th>
                  <th className="py-3.5 px-4">AI Wallet</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCoaches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No coaches matching the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCoaches.map((coach) => {
                    const orgs = organizations.filter((o) => coach.organizationIds.includes(o.id));
                    const plan = platformPlans.find((p) => p.id === coach.platformSubscriptionPlanId);
                    return (
                      <tr key={coach.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-teal-700 shrink-0">
                              {coach.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{coach.name}</p>
                              <p className="text-xs text-slate-500 truncate">{coach.email}</p>
                              {coach.specialty && (
                                <p className="text-[11px] text-teal-700 mt-0.5">{coach.specialty}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant={coach.status === 'active' ? 'active' : 'danger'} size="xs">
                            {coach.status}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            {orgs.map((o) => (
                              <span
                                key={o.id}
                                className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium"
                              >
                                <span className="w-4 h-4 rounded bg-slate-100 border border-slate-200 text-[10px] flex items-center justify-center text-teal-800 font-bold">{o.name.charAt(0)}</span>
                                <span className="truncate max-w-[140px]">{o.name}</span>
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant="info" size="xs">
                            {plan?.name || 'Professional'}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-semibold text-amber-700">
                            {coach.aiBalance.toLocaleString()} pts
                          </span>
                        </td>

                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => setSelectedCoach(coach)}
                            >
                              Inspect
                            </Button>
                            <Button
                              variant={coach.status === 'active' ? 'danger' : 'secondary'}
                              size="xs"
                              onClick={() => handleToggleStatus(coach)}
                            >
                              {coach.status === 'active' ? 'Suspend' : 'Restore'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Coach Detail Drawer */}
        <Drawer
          isOpen={!!selectedCoach}
          onClose={() => setSelectedCoach(null)}
          title={selectedCoach?.name || 'Coach Details'}
          description={selectedCoach?.email}
          maxWidth="lg"
        >
          {selectedCoach && (
            <div className="flex flex-col gap-6">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Account Overview
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500">Account ID</span>
                    <p className="text-xs font-mono font-bold text-slate-900 mt-1">{selectedCoach.id}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500">Account Status</span>
                    <div className="mt-1">
                      <Badge variant={selectedCoach.status === 'active' ? 'active' : 'danger'} size="xs">
                        {selectedCoach.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Specialty & Bio
                </h4>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <p className="font-semibold text-teal-800 mb-1">{selectedCoach.specialty}</p>
                  <p>{selectedCoach.bio || 'No public bio provided.'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  AI Wallet & Credits
                </h4>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500">Current Balance</span>
                    <p className="text-xl font-bold font-mono text-amber-700 mt-0.5">
                      {selectedCoach.aiBalance.toLocaleString()} pts
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="xs"
                    leftIcon={<Coins className="w-3.5 h-3.5 text-amber-600" />}
                    onClick={() => {
                      updateCoachAccount(selectedCoach.id, {
                        aiBalance: selectedCoach.aiBalance + 1000,
                      });
                      setSelectedCoach({
                        ...selectedCoach,
                        aiBalance: selectedCoach.aiBalance + 1000,
                      });
                      showToast('Credits Granted', '+1,000 AI credits credited by Super Admin', 'success');
                    }}
                  >
                    +1,000 Grant
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  variant={selectedCoach.status === 'active' ? 'danger' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleStatus(selectedCoach)}
                >
                  {selectedCoach.status === 'active' ? 'Suspend Coach Account' : 'Restore Coach Account'}
                </Button>
              </div>
            </div>
          )}
        </Drawer>

        {/* Provision Coach Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Provision New Coach Account"
          description="Create a new coach profile and seed initial organization."
          maxWidth="md"
        >
          <form onSubmit={handleCreateCoach} className="flex flex-col gap-4">
            <Input
              label="Coach Full Name"
              required
              value={newCoachName}
              onChange={(e) => setNewCoachName(e.target.value)}
              placeholder="e.g. Marcus Vance"
            />
            <Input
              label="Coach Email"
              type="email"
              required
              value={newCoachEmail}
              onChange={(e) => setNewCoachEmail(e.target.value)}
              placeholder="e.g. marcus@vancefitness.com"
            />
            <Input
              label="Specialty / Niche"
              value={newCoachSpecialty}
              onChange={(e) => setNewCoachSpecialty(e.target.value)}
              placeholder="e.g. Olympic Weightlifting & Strength"
            />
            <Input
              label="Initial Organization Name"
              value={newCoachOrgName}
              onChange={(e) => setNewCoachOrgName(e.target.value)}
              placeholder="e.g. Vance Athletic Club"
            />
            <Select
              label="Platform Tier"
              value={newCoachPlan}
              onChange={(e) => setNewCoachPlan(e.target.value)}
            >
              <option value="plan_starter">Starter Plan ($49/mo)</option>
              <option value="plan_pro">Professional Plan ($99/mo)</option>
              <option value="plan_business">Enterprise / Scale ($199/mo)</option>
            </Select>

            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Provision Account
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
