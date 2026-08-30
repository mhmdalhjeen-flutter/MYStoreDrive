'use client';

import { AdminShell } from '@/components/layout/AdminShell';
import { AdminGuard } from '@/components/auth/AdminGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
