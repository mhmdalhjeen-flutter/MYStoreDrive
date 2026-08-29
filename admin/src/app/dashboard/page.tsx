'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await apiClient.get('/analytics/overview');
      setOverview(response.data.data);
    } catch (error) {
      console.error('Failed to fetch overview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card h-28">
              <div className="skeleton h-4 w-20 mb-2" />
              <div className="skeleton h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">لوحة التحكم</h1>

      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="إجمالي الطلبات" value={overview.totalOrders} />
          <StatCard title="طلبات اليوم" value={overview.ordersToday} />
          <StatCard title="إجمالي العملاء" value={overview.totalCustomers} />
          <StatCard title="إجمالي المنتجات" value={overview.productCount} />
          <StatCard title="المتاح" value={overview.availableProducts} />
          <StatCard title="غير متاح" value={overview.outOfStockProducts} />
          <StatCard title="إجمالي الإيرادات" value={overview.totalRevenue} />
          <StatCard title="متوسط قيمة الطلب" value={overview.averageOrderValue} />
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
