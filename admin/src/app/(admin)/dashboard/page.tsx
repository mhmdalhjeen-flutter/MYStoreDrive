'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import type { AnalyticsOverview } from '@/lib/types';
import { formatPrice, getErrorMessage } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingGrid, ErrorState } from '@/components/ui/StateViews';

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminApi.getAnalytics());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PageHeader
        title="لوحة التحكم"
        action={
          <button type="button" className="btn-secondary" onClick={load} disabled={loading}>
            <RefreshCw className="w-4 h-4 ml-2" /> تحديث
          </button>
        }
      />
      {loading && <LoadingGrid count={12} />}
      {error && <ErrorState message={error} onRetry={load} />}
      {data && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="إجمالي الطلبات" value={data.totalOrders} />
          <StatCard title="طلبات اليوم" value={data.ordersToday} />
          <StatCard title="الطلبات المؤكدة" value={data.confirmedOrders} />
          <StatCard title="مدفوعات معلقة" value={data.pendingPayments} />
          <StatCard title="مدفوعات مرفوضة" value={data.rejectedPayments} />
          <StatCard title="إجمالي المبيعات" value={`${formatPrice(data.totalRevenue)} ₪`} />
          <StatCard title="متوسط قيمة الطلب" value={`${formatPrice(data.averageOrderValue)} ₪`} />
          <StatCard title="عدد المنتجات" value={data.productCount} />
          <StatCard title="منتجات متاحة" value={data.availableProducts} />
          <StatCard title="غير متوفرة" value={data.outOfStockProducts} />
          <StatCard title="عدد العملاء" value={data.totalCustomers} />
          <StatCard title="المفضلة" value={data.favoritesCount} />
          <StatCard title="رسائل دعم جديدة" value={data.unreadSupport} />
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
