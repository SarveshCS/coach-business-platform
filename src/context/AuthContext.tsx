'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, Membership, GlobalRole } from '@/types';
import { useData } from './DataContext';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  globalRole: GlobalRole | null;
  userMemberships: Membership[];
  hasActiveMemberships: boolean;
  login: (email: string, password?: string) => { success: boolean; message?: string };
  logout: () => void;
  switchDemoUser: (persona: 'admin' | 'coach' | 'member' | 'multi' | 'orphan' | 'banned') => void;
  setCurrentUserById: (userId: string) => void;
}

const AUTH_STORAGE_KEY = 'coach_platform_auth_user_id';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, memberships } = useData();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedId = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedId && users.some((u) => u.id === savedId)) {
        setCurrentUserId(savedId);
      } else {
        // Default to coach for initial load if nothing is saved
        setCurrentUserId('usr_coach_1');
      }
    } catch {
      setCurrentUserId('usr_coach_1');
    } finally {
      setIsLoaded(true);
    }
  }, [users]);

  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return users.find((u) => u.id === currentUserId) || null;
  }, [currentUserId, users]);

  const userMemberships = useMemo(() => {
    if (!currentUser) return [];
    return memberships.filter((m) => m.userId === currentUser.id && m.status === 'active');
  }, [currentUser, memberships]);

  const hasActiveMemberships = useMemo(() => {
    return userMemberships.length > 0;
  }, [userMemberships]);

  const globalRole = currentUser?.globalRole || null;

  const login = useCallback(
    (email: string, password?: string) => {
      const cleanEmail = email.toLowerCase().trim();
      const targetUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

      if (!targetUser) {
        return {
          success: false,
          message: 'No account found with this email. Try one of the demo accounts.',
        };
      }

      // Simple demo password check (demo accepts standard demo password or any 6+ chars)
      if (password && password.length < 4) {
        return {
          success: false,
          message: 'Password must be at least 4 characters.',
        };
      }

      setCurrentUserId(targetUser.id);
      localStorage.setItem(AUTH_STORAGE_KEY, targetUser.id);
      return { success: true };
    },
    [users]
  );

  const logout = useCallback(() => {
    setCurrentUserId(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const setCurrentUserById = useCallback((userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem(AUTH_STORAGE_KEY, userId);
  }, []);

  const switchDemoUser = useCallback(
    (persona: 'admin' | 'coach' | 'member' | 'multi' | 'orphan' | 'banned') => {
      const mapping = {
        admin: 'usr_admin',
        coach: 'usr_coach_1',
        member: 'usr_member_1',
        multi: 'usr_member_multi',
        orphan: 'usr_member_orphan',
        banned: 'usr_member_banned',
      };
      const targetId = mapping[persona];
      if (targetId) {
        setCurrentUserById(targetId);
      }
    },
    [setCurrentUserById]
  );

  if (!isLoaded) {
    return null; // Avoid hydration mismatch
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        globalRole,
        userMemberships,
        hasActiveMemberships,
        login,
        logout,
        switchDemoUser,
        setCurrentUserById,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
