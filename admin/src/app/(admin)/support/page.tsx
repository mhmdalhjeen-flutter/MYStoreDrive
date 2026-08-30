'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';
import type { SupportMessage } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';

export default function SupportPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMessages(await adminApi.getSupportMessages(unreadOnly));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => { load(); }, [load]);

  const threads = messages.reduce<Record<string, SupportMessage>>((acc, m) => {
    if (!acc[m.userId] || new Date(m.createdAt) > new Date(acc[m.userId].createdAt)) {
      acc[m.userId] = m;
    }
    return acc;
  }, {});

  const threadList = Object.values(threads).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div>
      <PageHeader title="الدعم" />
      <div className="flex gap-2 mb-4">
        <button type="button" className={!unreadOnly ? 'btn-primary' : 'btn-secondary'} onClick={() => setUnreadOnly(false)}>الكل</button>
        <button type="button" className={unreadOnly ? 'btn-primary' : 'btn-secondary'} onClick={() => setUnreadOnly(true)}>غير المقروء</button>
      </div>

      {loading && <div className="card skeleton h-48" />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && threadList.length === 0 && <EmptyState message="لا توجد محادثات" />}

      {!loading && !error && threadList.length > 0 && (
        <div className="space-y-2">
          {threadList.map((m) => (
            <Link key={m.userId} href={`/support/${m.userId}`} className="card block hover:shadow-card-hover transition-shadow">
              <div className="flex justify-between">
                <span className="font-medium">{m.user?.name ?? m.user?.phoneNumber ?? 'عميل'}</span>
                {!m.isRead && !m.isAdmin && <span className="badge-warning">جديد</span>}
              </div>
              <p className="text-sm text-gray-500 truncate">{m.subject}</p>
              <p className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString('ar')}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
