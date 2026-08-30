'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { storeApi } from '@/lib/store-api';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, ORDER_STATUS_AR, PAYMENT_STATUS_AR } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersContent />
    </AuthGuard>
  );
}

function OrdersContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: storeApi.getOrders,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  const orders = data ?? [];

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">طلباتي</h1>
      {orders.length === 0 ? (
        <EmptyState title="لا توجد طلبات" description="ستظهر طلباتك هنا بعد الشراء" />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="card block hover:shadow-card-hover">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{ORDER_STATUS_AR[order.status] ?? order.status}</span>
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded">{PAYMENT_STATUS_AR[order.paymentStatus] ?? order.paymentStatus}</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold">{formatPrice(order.total)} ₪</p>
                  <ChevronLeft className="w-5 h-5 text-gray-400 mt-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
