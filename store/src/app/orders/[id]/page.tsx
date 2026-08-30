'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { storeApi } from '@/lib/store-api';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  formatPrice,
  ORDER_STATUS_AR,
  PAYMENT_STATUS_AR,
  getErrorMessage,
} from '@/lib/utils';
import { useToastStore } from '@/stores/toast-store';

export default function OrderDetailPage() {
  return (
    <AuthGuard>
      <OrderDetailContent />
    </AuthGuard>
  );
}

function OrderDetailContent() {
  const { id } = useParams<{ id: string }>();
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const toast = useToastStore((s) => s.show);
  const qc = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => storeApi.getOrder(id),
    enabled: !!id,
  });

  const { data: paymentSettings } = useQuery({
    queryKey: ['payment-settings'],
    queryFn: storeApi.getPaymentSettings,
    enabled: !!order && (order.paymentStatus === 'PENDING' || order.paymentStatus === 'REJECTED'),
  });

  const submitPayment = useMutation({
    mutationFn: async () => {
      let proofUrl: string | undefined;
      if (proofFile) {
        const uploaded = await storeApi.uploadPaymentProof(proofFile);
        proofUrl = uploaded.url;
      }
      return storeApi.submitPayment(id, {
        paymentReference: paymentRef,
        paymentNotes: paymentNotes || undefined,
        paymentProof: proofUrl,
      });
    },
    onSuccess: () => {
      toast('تم إرسال معلومات الدفع', 'success');
      qc.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-6"><Skeleton className="h-64 w-full" /></div>;
  }

  if (!order) {
    return <div className="container mx-auto px-4 py-10 text-center">الطلب غير موجود</div>;
  }

  const canSubmitPayment =
    (order.status === 'PENDING' && order.paymentStatus === 'PENDING') ||
    (order.status === 'PAYMENT_REJECTED' && order.paymentStatus === 'REJECTED');

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">تفاصيل الطلب</h1>
      <div className="card space-y-2 text-sm">
        <p><span className="text-gray-500">رقم الطلب:</span> {order.orderNumber}</p>
        <p><span className="text-gray-500">الحالة:</span> {ORDER_STATUS_AR[order.status]}</p>
        <p><span className="text-gray-500">الدفع:</span> {PAYMENT_STATUS_AR[order.paymentStatus]}</p>
        <p><span className="text-gray-500">العنوان:</span> {order.deliveryAddress}</p>
        {order.deliveryArea && <p><span className="text-gray-500">المنطقة:</span> {order.deliveryArea.name}</p>}
        {order.adminPaymentNotes && (
          <p className="text-error-600"><span className="font-medium">ملاحظة الإدارة:</span> {order.adminPaymentNotes}</p>
        )}
      </div>

      <div className="card">
        <h2 className="font-medium mb-3">المنتجات</h2>
        <div className="space-y-3">
          {order.items.map((item) => {
            let variantLabel = '';
            if (item.variantInfo) {
              try {
                const v = JSON.parse(item.variantInfo);
                variantLabel = v.name;
              } catch { /* ignore */ }
            }
            return (
              <div key={item.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  {variantLabel && <p className="text-xs text-gray-500">{variantLabel}</p>}
                  <p className="text-xs text-gray-500">× {item.quantity}</p>
                </div>
                <p className="font-medium">{formatPrice(item.price)} ₪</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card space-y-1 text-sm">
        <div className="flex justify-between"><span>المجموع الفرعي</span><span>{formatPrice(order.subtotal)} ₪</span></div>
        <div className="flex justify-between"><span>التوصيل</span><span>{formatPrice(order.deliveryFee)} ₪</span></div>
        <div className="flex justify-between font-bold pt-2 border-t"><span>الإجمالي</span><span>{formatPrice(order.total)} ₪</span></div>
      </div>

      {canSubmitPayment && paymentSettings && (
        <div className="card space-y-4">
          <h2 className="font-medium">تعليمات الدفع</h2>
          {paymentSettings.paymentInstructions && (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{paymentSettings.paymentInstructions}</p>
          )}
          {paymentSettings.paymentAccountDetails && (
            <p className="text-sm bg-gray-50 p-3 rounded-xl">{paymentSettings.paymentAccountDetails}</p>
          )}
          {paymentSettings.paymentQrImage && (
            <div className="relative w-48 h-48 mx-auto">
              <Image src={paymentSettings.paymentQrImage} alt="QR الدفع" fill className="object-contain" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">مرجع الدفع *</label>
            <Input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="رقم الحوالة أو المرجع" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ملاحظات (اختياري)</label>
            <Textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">صورة إثبات الدفع (اختياري)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>
          <Button
            className="w-full"
            loading={submitPayment.isPending}
            disabled={!paymentRef.trim()}
            onClick={() => submitPayment.mutate()}
          >
            إرسال معلومات الدفع
          </Button>
        </div>
      )}

      {order.paymentStatus === 'SUBMITTED' && (
        <div className="card bg-primary-50 text-primary-800 text-sm">
          تم إرسال معلومات الدفع. بانتظار مراجعة الإدارة.
          {order.paymentReference && <p className="mt-1">المرجع: {order.paymentReference}</p>}
        </div>
      )}

      {order.paymentStatus === 'VERIFIED' && (
        <div className="card bg-success-50 text-success-700 text-sm">✓ تم التحقق من الدفع</div>
      )}
    </div>
  );
}
