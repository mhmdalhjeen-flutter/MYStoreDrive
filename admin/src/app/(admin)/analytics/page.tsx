'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import type { AnalyticsOverview } from '@/lib/types';
import { formatPrice, getErrorMessage } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingGrid, ErrorState } from '@/components/ui/StateViews';

export default function AnalyticsPage() {
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
        title="التحليلات"
        action={
          <button type="button" className="btn-secondary" onClick={load} disabled={loading}>
            <RefreshCw className="w-4 h-4 ml-2" /> تحديث
          </button>
        }
      />

      <p className="text-sm text-gray-500 mb-4">
        البيانات المعروضة من واجهة التحليلات الحالية. لا تتوفر بيانات تاريخية زمنية للرسوم البيانية.
      </p>

      {loading && <LoadingGrid count={8} />}
      {error && <ErrorState message={error} onRetry={load} />}

      {data && !loading && (
        <div className="space-y-6">
          <section>
            <h2 className="font-bold mb-3">المبيعات والطلبات</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Metric label="إجمالي المبيعات" value={`${formatPrice(data.totalRevenue)} ₪`} />
              <Metric label="متوسط قيمة الطلب" value={`${formatPrice(data.averageOrderValue)} ₪`} />
              <Metric label="إجمالي الطلبات" value={data.totalOrders} />
              <Metric label="طلبات اليوم" value={data.ordersToday} />
              <Metric label="طلبات مؤكدة" value={data.confirmedOrders} />
              <Metric label="مدفوعات معلقة" value={data.pendingPayments} />
              <Metric label="مدفوعات مرفوضة" value={data.rejectedPayments} />
            </div>
          </section>
          <section>
            <h2 className="font-bold mb-3">المنتجات والعملاء</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Metric label="عدد المنتجات" value={data.productCount} />
              <Metric label="منتجات متاحة" value={data.availableProducts} />
              <Metric label="غير متوفرة" value={data.outOfStockProducts} />
              <Metric label="عدد العملاء" value={data.totalCustomers} />
              <Metric label="المفضلة" value={data.favoritesCount} />
              <Metric label="رسائل دعم جديدة" value={data.unreadSupport} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
