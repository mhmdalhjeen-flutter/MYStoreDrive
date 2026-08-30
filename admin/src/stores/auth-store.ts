'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearAdminTokens, setAdminTokens } from '@/lib/api';

interface AdminAuthState {
  isAuthenticated: boolean;
  email: string | null;
  setAuth: (email: string, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      email: null,
      setAuth: (email, accessToken, refreshToken) => {
        setAdminTokens(accessToken, refreshToken);
        set({ isAuthenticated: true, email });
      },
      logout: () => {
        clearAdminTokens();
        set({ isAuthenticated: false, email: null });
      },
    }),
    { name: 'admin-auth', partialize: (s) => ({ isAuthenticated: s.isAuthenticated, email: s.email }) },
  ),
);
