'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeApi } from '@/lib/store-api';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { FreeDeliveryProgress } from '@/components/cart/FreeDeliveryProgress';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCheckoutStore } from '@/stores/checkout-store';
import { formatPrice, getErrorMessage } from '@/lib/utils';
import { useToastStore } from '@/stores/toast-store';
import { StoreClosedAlert, useStoreOpen } from '@/components/store/StoreStatus';

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutContent />
    </AuthGuard>
  );
}

function CheckoutContent() {
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const deliveryAreaId = useCheckoutStore((s) => s.deliveryAreaId);
  const setDeliveryAreaId = useCheckoutStore((s) => s.setDeliveryAreaId);
  const router = useRouter();
  const toast = useToastStore((s) => s.show);
  const qc = useQueryClient();
  const { isOpen } = useStoreOpen();

  const { data: areas } = useQuery({
    queryKey: ['delivery-areas'],
    queryFn: storeApi.getDeliveryAreas,
  });

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart', deliveryAreaId],
    queryFn: () => storeApi.getCart(deliveryAreaId ?? undefined),
    enabled: !!deliveryAreaId,
  });

  const { data: cartNoArea } = useQuery({
    queryKey: ['cart'],
    queryFn: () => storeApi.getCart(),
    enabled: !deliveryAreaId,
  });

  const activeCart = deliveryAreaId ? cart : cartNoArea;
  const summary = activeCart?.summary;

  const createOrder = useMutation({
    mutationFn: () =>
      storeApi.createOrder({
        deliveryAreaId: deliveryAreaId!,
        deliveryAddress: address,
        notes: notes || undefined,
      }),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      toast('تم إنشاء الطلب بنجاح', 'success');
      router.push(`/orders/${order.id}`);
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  if (isLoading && deliveryAreaId) {
    return <div className="container mx-auto px-4 py-6"><Skeleton className="h-40 w-full" /></div>;
  }

  const items = activeCart?.items ?? [];
  if (items.length === 0) {
    router.replace('/cart');
    return null;
  }

  const total = summary ? summary.subtotal + summary.deliveryFee : 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">إتمام الطلب</h1>
      <StoreClosedAlert />

      <div className="space-y-4">
        <div className="card">
          <label className="block text-sm font-medium mb-2">منطقة التوصيل *</label>
          <select
            className="input"
            value={deliveryAreaId ?? ''}
            onChange={(e) => setDeliveryAreaId(e.target.value || null)}
          >
            <option value="">اختر المنطقة</option>
            {(areas ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {formatPrice(a.deliveryFee)} ₪
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">الرسوم النهائية تُحسب من الخادم</p>
        </div>

        {summary && deliveryAreaId && <FreeDeliveryProgress summary={summary} />}

        <div className="card">
          <label className="block text-sm font-medium mb-2">العنوان التفصيلي *</label>
          <Textarea
            placeholder="الشارع، المبنى، علامة مميزة..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
          />
        </div>

        <div className="card">
          <label className="block text-sm font-medium mb-2">ملاحظات (اختياري)</label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات للتوصيل" />
        </div>

        {summary && (
          <div className="card space-y-2 text-sm">
            <p className="font-medium">ملخص الطلب</p>
            <div className="flex justify-between"><span>{summary.itemCount} منتج ({summary.totalItems} قطعة)</span></div>
            <div className="flex justify-between"><span>المجموع الفرعي</span><span>{formatPrice(summary.subtotal)} ₪</span></div>
            <div className="flex justify-between"><span>التوصيل</span><span>{formatPrice(summary.deliveryFee)} ₪</span></div>
            <div className="flex justify-between font-bold pt-2 border-t"><span>الإجمالي</span><span>{formatPrice(total)} ₪</span></div>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          loading={createOrder.isPending}
          disabled={!isOpen || !deliveryAreaId || !address.trim()}
          onClick={() => createOrder.mutate()}
        >
          تأكيد الطلب
        </Button>
      </div>
    </div>
  );
}
