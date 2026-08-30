'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';
import type { Order } from '@/lib/types';
import { formatPrice, getErrorMessage } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { OrderBadge, PaymentBadge } from '@/components/ui/StatusBadge';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'submitted'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await adminApi.getOrders());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'submitted'
    ? orders.filter((o) => o.paymentStatus === 'SUBMITTED')
    : orders;

  return (
    <div>
      <PageHeader title="الطلبات" />
      <div className="flex gap-2 mb-4">
        <button type="button" className={filter === 'all' ? 'btn-primary' : 'btn-secondary'} onClick={() => setFilter('all')}>الكل</button>
        <button type="button" className={filter === 'submitted' ? 'btn-primary' : 'btn-secondary'} onClick={() => setFilter('submitted')}>بانتظار التحقق</button>
      </div>

      {loading && <div className="card skeleton h-48" />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && filtered.length === 0 && <EmptyState message="لا توجد طلبات" />}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="hidden md:block card overflow-x-auto p-0">
            <table className="table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>العميل</th>
                  <th>الهاتف</th>
                  <th>التاريخ</th>
                  <th>المجموع</th>
                  <th>منطقة التوصيل</th>
                  <th>الدفع</th>
                  <th>الحالة</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td>{o.orderNumber}</td>
                    <td>{o.customer?.name ?? '—'}</td>
                    <td className="ltr-input" dir="ltr">{o.customer?.phoneNumber}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString('ar')}</td>
                    <td>{formatPrice(o.total)} ₪</td>
                    <td>{o.deliveryArea?.name ?? '—'}</td>
                    <td><PaymentBadge status={o.paymentStatus} /></td>
                    <td><OrderBadge status={o.status} /></td>
                    <td><Link href={`/orders/${o.id}`} className="text-primary-600 text-sm">تفاصيل</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {filtered.map((o) => (
              <Link key={o.id} href={`/orders/${o.id}`} className="card block">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{o.orderNumber}</span>
                  <PaymentBadge status={o.paymentStatus} />
                </div>
                <p className="text-sm text-gray-500">{o.customer?.phoneNumber} · {formatPrice(o.total)} ₪</p>
                <OrderBadge status={o.status} />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
