'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Organization, Membership } from '@/types';
import { useData } from './DataContext';
import { useAuth } from './AuthContext';

interface TenantContextType {
  currentOrganization: Organization | null;
  currentOrganizationId: string | null;
  currentMembership: Membership | null;
  availableOrganizations: Organization[];
  switchOrganization: (orgId: string) => void;
  branding: Organization['branding'] | null;
  entitlements: Organization['entitlements'] | null;
  isCommunityBanned: boolean;
}

const ORG_STORAGE_KEY = 'coach_platform_active_org_id';

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { organizations, memberships } = useData();
  const { currentUser, globalRole } = useAuth();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Available organizations for current user
  const availableOrganizations = useMemo(() => {
    if (!currentUser) return [];

    // Super Admin can view all organizations
    if (globalRole === 'super_admin') {
      return organizations;
    }

    // Coach can view organizations they own or are members of
    if (globalRole === 'coach') {
      const coachMemberOrgIds = memberships
        .filter((m) => m.userId === currentUser.id && m.status === 'active')
        .map((m) => m.organizationId);
      return organizations.filter(
        (o) => o.ownerCoachId === currentUser.id || coachMemberOrgIds.includes(o.id)
      );
    }

    // Member can view organizations where they hold active membership
    const memberOrgIds = memberships
      .filter((m) => m.userId === currentUser.id && m.status === 'active')
      .map((m) => m.organizationId);

    return organizations.filter((o) => memberOrgIds.includes(o.id));
  }, [currentUser, globalRole, organizations, memberships]);

  // Initial active organization resolution
  useEffect(() => {
    if (availableOrganizations.length === 0) {
      setSelectedOrgId(null);
      return;
    }

    try {
      const savedOrgId = localStorage.getItem(ORG_STORAGE_KEY);
      if (savedOrgId && availableOrganizations.some((o) => o.id === savedOrgId)) {
        setSelectedOrgId(savedOrgId);
      } else {
        setSelectedOrgId(availableOrganizations[0].id);
      }
    } catch {
      setSelectedOrgId(availableOrganizations[0].id);
    }
  }, [availableOrganizations]);

  const currentOrganization = useMemo(() => {
    if (!selectedOrgId) return availableOrganizations[0] || null;
    return organizations.find((o) => o.id === selectedOrgId) || availableOrganizations[0] || null;
  }, [selectedOrgId, organizations, availableOrganizations]);

  const currentMembership = useMemo(() => {
    if (!currentUser || !currentOrganization) return null;
    return (
      memberships.find(
        (m) => m.userId === currentUser.id && m.organizationId === currentOrganization.id
      ) || null
    );
  }, [currentUser, currentOrganization, memberships]);

  const isCommunityBanned = useMemo(() => {
    return currentMembership?.communityStatus === 'banned';
  }, [currentMembership]);

  const switchOrganization = useCallback((orgId: string) => {
    setSelectedOrgId(orgId);
    try {
      localStorage.setItem(ORG_STORAGE_KEY, orgId);
    } catch (e) {
      console.warn('Could not save active org to localStorage', e);
    }
  }, []);

  // Dynamically inject custom branding CSS custom properties to document root
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (currentOrganization?.branding) {
      const { primaryColor, secondaryColor } = currentOrganization.branding;
      document.documentElement.style.setProperty('--org-primary', primaryColor || '#0284c7');
      document.documentElement.style.setProperty('--org-secondary', secondaryColor || '#0f172a');
    }
  }, [currentOrganization]);

  return (
    <TenantContext.Provider
      value={{
        currentOrganization,
        currentOrganizationId: currentOrganization?.id || null,
        currentMembership,
        availableOrganizations,
        switchOrganization,
        branding: currentOrganization?.branding || null,
        entitlements: currentOrganization?.entitlements || null,
        isCommunityBanned,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
