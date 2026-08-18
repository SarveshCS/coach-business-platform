'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/context/ToastContext';
import { Globe, Save } from 'lucide-react';

export default function SuperAdminSettingsPage() {
  const { showToast } = useToast();
  const [platformName, setPlatformName] = useState('CoachOS Multi-Tenant');
  const [supportEmail, setSupportEmail] = useState('support@coachos.io');
  const [currency, setCurrency] = useState('USD');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Platform Settings Saved', 'Global configuration successfully updated.', 'success');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-3xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure platform-wide branding, support endpoints, and default multi-tenant settings.
          </p>
        </div>

        <Card className="bg-white shadow-2xs">
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-700" />
              General Platform Identity
            </h3>

            <Input
              label="Platform Brand Name"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
            />

            <Input
              label="Global Support Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />

            <Select
              label="Default Base Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </Select>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="primary" size="sm" type="submit" leftIcon={<Save className="w-4 h-4" />}>
                Save Platform Config
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
