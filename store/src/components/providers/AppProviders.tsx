'use client';

import { StoreShell } from '@/components/layout/StoreShell';
import { ToastContainer } from '@/components/ui/Toast';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreShell>{children}</StoreShell>
      <ToastContainer />
    </>
  );
}
