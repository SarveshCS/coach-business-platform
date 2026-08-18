'use client';

import React from 'react';
import { ToastProvider } from './ToastContext';
import { DataProvider } from './DataContext';
import { AuthProvider } from './AuthContext';
import { TenantProvider } from './TenantContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      <DataProvider>
        <AuthProvider>
          <TenantProvider>{children}</TenantProvider>
        </AuthProvider>
      </DataProvider>
    </ToastProvider>
  );
};
