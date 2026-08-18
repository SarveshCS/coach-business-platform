'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { Organization } from '@/types';
import { Search, Users, Calendar, Brain } from 'lucide-react';

export default function SuperAdminOrganizationsPage() {
  const { organizations, coachAccounts, memberships, updateOrganization } = useData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      const matchesSearch =
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [organizations, searchQuery, statusFilter]);

  const handleToggleStatus = (org: Organization) => {
    const nextStatus = org.status === 'active' ? 'suspended' : 'active';
    updateOrganization(org.id, { status: nextStatus });
    showToast(
      `Organization ${nextStatus === 'active' ? 'Activated' : 'Suspended'}`,
      `${org.name} status updated to ${nextStatus}`,
      nextStatus === 'active' ? 'success' : 'warning'
    );
    if (selectedOrg && selectedOrg.id === org.id) {
      setSelectedOrg({ ...selectedOrg, status: nextStatus });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tenant Organizations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Isolate and inspect multi-tenant coaching organizations, branding themes, and subscription limits.
          </p>
        </div>

        {/* Filter Bar */}
        <Card className="p-3.5 bg-white shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1">
              <Input
                placeholder="Search organizations by name or slug..."
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

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map((org) => {
            const ownerCoach = coachAccounts.find((c) => c.id === org.ownerCoachId);
            const memberCount = memberships.filter((m) => m.organizationId === org.id).length;

            return (
              <Card
                key={org.id}
                className="flex flex-col justify-between hover:border-slate-300 transition-all group bg-white shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-base border border-slate-200 bg-slate-100 text-teal-800"
                      >
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-teal-700 transition-colors">
                          {org.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">/{org.slug}</p>
                      </div>
                    </div>
                    <Badge variant={org.status === 'active' ? 'active' : 'danger'} size="xs">
                      {org.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                    {org.description || 'No organization description provided.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs mb-4">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Owner Coach</span>
                      <span className="font-semibold text-slate-900 truncate block">
                        {ownerCoach?.name || 'Rahul Sharma'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Enrolled Members</span>
                      <span className="font-semibold text-teal-700">
                        {memberCount} / {org.entitlements.maxMembers}
                      </span>
                    </div>
                  </div>

                  {/* Entitlement Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                        org.entitlements.aiEnabled
                          ? 'bg-teal-50 text-teal-800 border border-teal-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Brain className="w-3 h-3" /> AI {org.entitlements.aiEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                        org.entitlements.communityEnabled
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Users className="w-3 h-3" /> Community
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                        org.entitlements.classesEnabled
                          ? 'bg-sky-50 text-sky-800 border border-sky-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Calendar className="w-3 h-3" /> Classes
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full border border-slate-300"
                      style={{ backgroundColor: org.branding.primaryColor }}
                      title="Primary Color"
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-slate-300"
                      style={{ backgroundColor: org.branding.secondaryColor }}
                      title="Secondary Color"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="xs" onClick={() => setSelectedOrg(org)}>
                      Inspect
                    </Button>
                    <Button
                      variant={org.status === 'active' ? 'danger' : 'secondary'}
                      size="xs"
                      onClick={() => handleToggleStatus(org)}
                    >
                      {org.status === 'active' ? 'Suspend' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Organization Detail Drawer */}
        <Drawer
          isOpen={!!selectedOrg}
          onClose={() => setSelectedOrg(null)}
          title={selectedOrg?.name || 'Organization Details'}
          description={`Slug: /${selectedOrg?.slug}`}
        >
          {selectedOrg && (
            <div className="flex flex-col gap-6">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Branding Configuration
                </h4>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Primary Branding Color</span>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-slate-300"
                        style={{ backgroundColor: selectedOrg.branding.primaryColor }}
                      />
                      <span className="font-mono text-slate-900 font-semibold">
                        {selectedOrg.branding.primaryColor}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Secondary Accent Color</span>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-slate-300"
                        style={{ backgroundColor: selectedOrg.branding.secondaryColor }}
                      />
                      <span className="font-mono text-slate-900 font-semibold">
                        {selectedOrg.branding.secondaryColor}
                      </span>
                    </div>
                  </div>
                  {selectedOrg.branding.welcomeMessage && (
                    <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                      <span className="font-semibold text-slate-900 block mb-0.5">Welcome Message:</span>
                      "{selectedOrg.branding.welcomeMessage}"
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Feature Entitlements
                </h4>
                <div className="divide-y divide-slate-200 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-700">Max Member Enrollment</span>
                    <span className="font-bold text-teal-700">
                      {selectedOrg.entitlements.maxMembers} Members
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-700">AI Diet & Workout Generation</span>
                    <Badge variant={selectedOrg.entitlements.aiEnabled ? 'active' : 'default'} size="xs">
                      {selectedOrg.entitlements.aiEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-700">Private Org Community Feed</span>
                    <Badge variant={selectedOrg.entitlements.communityEnabled ? 'active' : 'default'} size="xs">
                      {selectedOrg.entitlements.communityEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-700">Live & In-Person Classes</span>
                    <Badge variant={selectedOrg.entitlements.classesEnabled ? 'active' : 'default'} size="xs">
                      {selectedOrg.entitlements.classesEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  variant={selectedOrg.status === 'active' ? 'danger' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleStatus(selectedOrg)}
                >
                  {selectedOrg.status === 'active' ? 'Suspend Organization' : 'Activate Organization'}
                </Button>
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </DashboardLayout>
  );
}
