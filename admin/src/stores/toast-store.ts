'use client';

import { create } from 'zustand';

export const useToast = create<{
  message: string | null;
  type: 'success' | 'error' | 'info';
  show: (message: string, type?: 'success' | 'error' | 'info') => void;
  clear: () => void;
}>((set) => ({
  message: null,
  type: 'info',
  show: (message, type = 'info') => {
    set({ message, type });
    setTimeout(() => set({ message: null }), 3500);
  },
  clear: () => set({ message: null }),
}));
