'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin-api';
import type { Review } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReviews(await adminApi.getReviews());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PageHeader title="التقييمات" />
      {loading && <div className="card skeleton h-48" />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && reviews.length === 0 && <EmptyState message="لا توجد تقييمات" />}

      {!loading && !error && reviews.length > 0 && (
        <>
          <div className="hidden md:block card overflow-x-auto p-0">
            <table className="table">
              <thead>
                <tr><th>المنتج</th><th>العميل</th><th>التقييم</th><th>التعليق</th><th>التاريخ</th></tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id}>
                    <td>{r.product?.name ?? '—'}</td>
                    <td>{r.user?.name ?? r.user?.phoneNumber ?? '—'}</td>
                    <td>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                    <td className="max-w-xs truncate">{r.comment ?? '—'}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString('ar')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="card">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{r.product?.name}</span>
                  <span>{'★'.repeat(r.rating)}</span>
                </div>
                <p className="text-sm text-gray-500">{r.user?.phoneNumber}</p>
                {r.comment && <p className="text-sm mt-2">{r.comment}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
