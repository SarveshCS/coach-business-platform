'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useTenant } from '@/context/TenantContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { Building2, Palette, Settings, Save } from 'lucide-react';

export default function CoachOrganizationPage() {
  const { currentOrganization } = useTenant();
  const { updateOrganization } = useData();
  const { showToast } = useToast();

  const orgId = currentOrganization?.id || 'org_1';

  // Branding states
  const [orgName, setOrgName] = useState(currentOrganization?.name || '');
  const [orgDesc, setOrgDesc] = useState(currentOrganization?.description || '');
  const [orgLogo, setOrgLogo] = useState(currentOrganization?.branding.logo || 'A');
  const [primaryColor, setPrimaryColor] = useState(currentOrganization?.branding.primaryColor || '#0f766e');
  const [secondaryColor, setSecondaryColor] = useState(currentOrganization?.branding.secondaryColor || '#0f172a');
  const [welcomeMessage, setWelcomeMessage] = useState(currentOrganization?.branding.welcomeMessage || '');

  // Settings states
  const [allowPosts, setAllowPosts] = useState(currentOrganization?.settings.allowMemberCommunityPosts ?? true);
  const [enableBooking, setEnableBooking] = useState(currentOrganization?.settings.enableClassBooking ?? true);
  const [enableAi, setEnableAi] = useState(currentOrganization?.settings.enableAiFeatures ?? true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) return;

    updateOrganization(currentOrganization.id, {
      name: orgName,
      description: orgDesc,
      branding: {
        ...currentOrganization.branding,
        logo: orgLogo,
        primaryColor,
        secondaryColor,
        welcomeMessage,
      },
      settings: {
        ...currentOrganization.settings,
        allowMemberCommunityPosts: allowPosts,
        enableClassBooking: enableBooking,
        enableAiFeatures: enableAi,
      },
    });

    showToast(
      'Organization Branding Saved',
      'Theme colors, logo, and client PWA settings updated dynamically.',
      'success'
    );
  };

  const presetThemes = [
    { name: 'Deep Teal & Slate', primary: '#0f766e', secondary: '#0f172a', logo: 'APEX' },
    { name: 'Forest & Emerald', primary: '#047857', secondary: '#064e3b', logo: 'FORGE' },
    { name: 'Classic Sky & Navy', primary: '#0284c7', secondary: '#0f172a', logo: 'VELOCITY' },
    { name: 'Royal Indigo', primary: '#4338ca', secondary: '#1e1b4b', logo: 'ZENITH' },
    { name: 'Charcoal & Amber', primary: '#d97706', secondary: '#1c1917', logo: 'TITAN' },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Organization Profile & Custom Branding
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Customize tenant logo, theme colors, welcome messaging, and client permissions. Changes dynamically theme the client PWA.
          </p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Identity Card */}
          <Card className="bg-white shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-teal-700" />
              Organization Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <Input
                label="Logo Monogram / Symbol"
                value={orgLogo}
                onChange={(e) => setOrgLogo(e.target.value)}
                className="text-center font-bold text-base"
              />
              <div className="sm:col-span-2">
                <Input
                  label="Organization Name"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
            </div>

            <Textarea
              label="Organization Bio / Description"
              rows={2}
              value={orgDesc}
              onChange={(e) => setOrgDesc(e.target.value)}
            />
          </Card>

          {/* Dynamic Theme Color Customizer */}
          <Card className="bg-white shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4 text-teal-700" />
              Dynamic Client PWA Theme & Colors
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select a curated preset or enter custom Hex color tokens.
            </p>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
              {presetThemes.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPrimaryColor(preset.primary);
                    setSecondaryColor(preset.secondary);
                    setOrgLogo(preset.logo);
                  }}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-teal-700 text-left flex flex-col justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-900 truncate">{preset.name}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Primary Accent Color (Hex)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg bg-transparent border border-slate-300 cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Secondary Neutral Color (Hex)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg bg-transparent border border-slate-300 cursor-pointer"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Input
                label="Client Welcome Banner Message"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="Welcome to your personalized training space!"
              />
            </div>
          </Card>

          {/* Client Permissions */}
          <Card className="bg-white shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-teal-700" />
              Trainee Permissions & Capabilities
            </h3>

            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Allow Member Community Posts</span>
                  <span className="text-[11px] text-slate-500">Members can publish text and photo posts to the community feed</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowPosts}
                  onChange={(e) => setAllowPosts(e.target.checked)}
                  className="rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Enable Live Class Booking</span>
                  <span className="text-[11px] text-slate-500">Members can browse scheduled classes and book spots</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableBooking}
                  onChange={(e) => setEnableBooking(e.target.checked)}
                  className="rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Enable AI Scanner Features</span>
                  <span className="text-[11px] text-slate-500">Allows trainees to scan meal photos using allocated AI credits</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableAi}
                  onChange={(e) => setEnableAi(e.target.checked)}
                  className="rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                />
              </label>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="primary" size="lg" type="submit" leftIcon={<Save className="w-4 h-4" />}>
              Save Branding & Settings
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
