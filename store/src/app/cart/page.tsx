'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeApi } from '@/lib/store-api';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { FreeDeliveryProgress } from '@/components/cart/FreeDeliveryProgress';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCheckoutStore } from '@/stores/checkout-store';
import { formatPrice, getErrorMessage } from '@/lib/utils';
import { useToastStore } from '@/stores/toast-store';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { StoreClosedAlert, useStoreOpen } from '@/components/store/StoreStatus';

export default function CartPage() {
  return (
    <AuthGuard>
      <CartContent />
    </AuthGuard>
  );
}

function CartContent() {
  const deliveryAreaId = useCheckoutStore((s) => s.deliveryAreaId);
  const toast = useToastStore((s) => s.show);
  const qc = useQueryClient();
  const { isOpen } = useStoreOpen();

  const { data, isLoading } = useQuery({
    queryKey: ['cart', deliveryAreaId],
    queryFn: () => storeApi.getCart(deliveryAreaId ?? undefined),
  });

  const updateQty = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      storeApi.updateCartItem(id, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  const removeItem = useMutation({
    mutationFn: (id: string) => storeApi.removeCartItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      toast('تم حذف المنتج', 'info');
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const items = data?.items ?? [];
  const summary = data?.summary;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <EmptyState
          title="السلة فارغة"
          description="ابدأ التسوق وأضف منتجاتك المفضلة"
          action={<Link href="/products"><Button>تصفح المنتجات</Button></Link>}
        />
      </div>
    );
  }

  const total = summary
    ? summary.subtotal + summary.deliveryFee
    : 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">سلة التسوق</h1>
      <StoreClosedAlert />
      {summary && <FreeDeliveryProgress summary={summary} className="mb-4" />}

      <div className="space-y-3 mb-6">
        {items.map((item) => {
          const unitPrice =
            parseFloat(String(item.product.price)) +
            (item.variant ? parseFloat(String(item.variant.priceAdjustment)) : 0);
          return (
            <div key={item.id} className="card flex gap-3">
              <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                {item.product.images?.[0] && (
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product.id}`} className="font-medium text-sm line-clamp-2 hover:text-primary-600">
                  {item.product.name}
                </Link>
                {item.variant && <p className="text-xs text-gray-500">{item.variant.name}</p>}
                <p className="text-sm font-bold text-primary-700 mt-1">{formatPrice(unitPrice)} ₪</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="p-1 border rounded"
                      onClick={() => updateQty.mutate({ id: item.id, quantity: item.quantity - 1 })}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      className="p-1 border rounded"
                      onClick={() => updateQty.mutate({ id: item.id, quantity: item.quantity + 1 })}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button type="button" onClick={() => removeItem.mutate(item.id)} className="text-error-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {summary && (
        <div className="card space-y-2 text-sm mb-4">
          <div className="flex justify-between"><span>المجموع الفرعي</span><span>{formatPrice(summary.subtotal)} ₪</span></div>
          <div className="flex justify-between"><span>رسوم التوصيل</span><span>{formatPrice(summary.deliveryFee)} ₪</span></div>
          {summary.deliveryDiscount > 0 && (
            <div className="flex justify-between text-success-600"><span>خصم التوصيل</span><span>-{formatPrice(summary.deliveryDiscount)} ₪</span></div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 border-t"><span>الإجمالي</span><span>{formatPrice(total)} ₪</span></div>
        </div>
      )}

      <Link href="/checkout">
        <Button className="w-full" size="lg" disabled={!isOpen}>
          {isOpen ? 'متابعة الدفع' : 'المتجر مغلق'}
        </Button>
      </Link>
    </div>
  );
}
