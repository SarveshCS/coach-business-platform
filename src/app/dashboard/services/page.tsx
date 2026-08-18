'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/utils/formatters';
import { Briefcase, Plus, CheckCircle2 } from 'lucide-react';

export default function CoachServicesPage() {
  const { currentOrganization } = useTenant();
  const { services, addService, updateService } = useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';
  const orgServices = services.filter((s) => s.organizationId === orgId);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(150);
  const [durationMonths, setDurationMonths] = useState(1);
  const [features, setFeatures] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addService({
      organizationId: orgId,
      name,
      description,
      price,
      durationMonths,
      features: features ? features.split(',').map((f) => f.trim()) : ['Custom Coaching'],
      status: 'active',
    });

    showToast('Service Created', `Added ${name} to coaching services catalog.`, 'success');
    setIsAddOpen(false);
    setName('');
    setDescription('');
    setFeatures('');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Coaching Services Catalog
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Define productized coaching offerings, 1-on-1 personal training packages, and pass tiers.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Service
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {orgServices.map((service) => (
            <Card key={service.id} className="flex flex-col justify-between bg-white border-slate-200 hover:border-slate-300 transition-all shadow-2xs">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100 text-teal-700">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <Badge variant={service.status === 'active' ? 'active' : 'default'} size="xs">
                    {service.status}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight">{service.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{service.description}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {formatCurrency(service.price)}
                  </span>
                  <span className="text-xs text-slate-500">
                    / {service.durationMonths === 1 ? 'month' : `${service.durationMonths} months`}
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Included Features</p>
                  {service.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-100 flex justify-end">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    updateService(service.id, {
                      status: service.status === 'active' ? 'inactive' : 'active',
                    });
                    showToast('Service Updated', `Status changed to ${service.status === 'active' ? 'inactive' : 'active'}`, 'info');
                  }}
                >
                  {service.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal */}
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Create New Coaching Service"
          description="Add a service offering to your business catalog."
          maxWidth="sm"
        >
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input
              label="Service Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 1-on-1 VIP Transformation"
            />
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Weekly calls, custom diet, WhatsApp check-ins"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price ($)"
                type="number"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value, 10))}
              />
              <Input
                label="Duration (Months)"
                type="number"
                value={durationMonths}
                onChange={(e) => setDurationMonths(parseInt(e.target.value, 10))}
              />
            </div>
            <Input
              label="Features (comma separated)"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="Weekly Audits, Direct Chat, Custom Macros"
            />

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Service
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
