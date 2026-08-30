'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { storeApi } from '@/lib/store-api';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/auth-store';
import { useToastStore } from '@/stores/toast-store';
import { formatPrice, getErrorMessage, availabilityLabel } from '@/lib/utils';
import { Heart, Minus, Plus, Star } from 'lucide-react';
import { useState } from 'react';
import { StoreClosedAlert, useStoreOpen } from '@/components/store/StoreStatus';
import type { ProductVariant } from '@/lib/types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const toast = useToastStore((s) => s.show);
  const qc = useQueryClient();
  const { isOpen } = useStoreOpen();
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => storeApi.getProduct(id),
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => storeApi.getProductReviews(id),
    enabled: !!id,
  });

  const { data: reviewSummary } = useQuery({
    queryKey: ['review-summary', id],
    queryFn: () => storeApi.getReviewSummary(id),
    enabled: !!id,
  });

  const { data: favStatus, refetch: refetchFav } = useQuery({
    queryKey: ['favorite', id],
    queryFn: () => storeApi.getFavoriteStatus(id),
    enabled: !!id && isAuthenticated,
  });

  const addCart = useMutation({
    mutationFn: () =>
      storeApi.addToCart(id, qty, variant?.id),
    onSuccess: () => {
      toast('تمت الإضافة إلى السلة', 'success');
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  const toggleFav = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    try {
      if (favStatus?.isFavorite) {
        await storeApi.removeFavorite(id);
        toast('تمت الإزالة من المفضلة', 'info');
      } else {
        await storeApi.addFavorite(id);
        toast('تمت الإضافة إلى المفضلة', 'success');
      }
      refetchFav();
    } catch (e) {
      toast(getErrorMessage(e), 'error');
    }
  };

  const submitReview = async () => {
    try {
      await storeApi.createReview(id, { rating, comment: comment || undefined });
      toast('شكراً على تقييمك', 'success');
      setComment('');
      qc.invalidateQueries({ queryKey: ['reviews', id] });
    } catch (e) {
      toast(getErrorMessage(e), 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-10 text-center">المنتج غير موجود</div>;
  }

  const hasVariants = product.variants && product.variants.length > 0;
  const unitPrice =
    parseFloat(String(product.price)) +
    (variant ? parseFloat(String(variant.priceAdjustment)) : 0);
  const canBuy = product.availability !== 'UNAVAILABLE' && product.isAvailable && isOpen;
  const stockInfo =
    product.availability === 'LIMITED'
      ? variant
        ? `المتوفر: ${variant.stock}`
        : `المتوفر: ${product.stock}`
      : product.availability === 'UNLIMITED'
        ? 'متوفر بدون حد'
        : null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <StoreClosedAlert />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
          {product.images?.[0] ? (
            <Image src={product.images[0]} alt={product.name} fill className="object-cover" priority />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">بدون صورة</div>
          )}
        </div>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="w-4 h-4 text-warning-500 fill-warning-500" />
            {reviewSummary?.reviewCount ? (
              <span>{reviewSummary.averageRating.toFixed(1)} ({reviewSummary.reviewCount} تقييم)</span>
            ) : (
              <span>لا توجد تقييمات بعد</span>
            )}
          </div>
          <p className="text-2xl font-bold text-primary-700">{formatPrice(unitPrice)} ₪</p>
          <p className="text-sm text-gray-500">
            {availabilityLabel(product.availability)}
            {stockInfo && ` — ${stockInfo}`}
          </p>
          <p className="text-sm text-primary-600">مساهمة التوصيل المجاني: {formatPrice(product.freeDeliveryValue)}</p>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {hasVariants && (
            <div>
              <p className="text-sm font-medium mb-2">اختر {product.variants![0].type}</p>
              <div className="flex flex-wrap gap-2">
                {product.variants!.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariant(v)}
                    className={`px-3 py-1.5 rounded-lg border text-sm ${variant?.id === v.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-sm">الكمية</span>
            <button type="button" className="p-2 border rounded-lg" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="w-4 h-4" /></button>
            <span className="w-8 text-center">{qty}</span>
            <button type="button" className="p-2 border rounded-lg" onClick={() => setQty(qty + 1)}><Plus className="w-4 h-4" /></button>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={!canBuy || (hasVariants && !variant) || addCart.isPending}
              loading={addCart.isPending}
              onClick={() => {
                if (!isAuthenticated) { router.push('/auth/login'); return; }
                addCart.mutate();
              }}
            >
              {canBuy ? 'أضف إلى السلة' : 'غير متاح للشراء'}
            </Button>
            <Button variant="outline" onClick={toggleFav} aria-label="مفضلة">
              <Heart className={`w-5 h-5 ${favStatus?.isFavorite ? 'fill-error-500 text-error-500' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-bold mb-4">التقييمات</h2>
        {isAuthenticated && (
            <div className="card mb-4 space-y-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)}>
                    <Star className={`w-6 h-6 ${n <= rating ? 'text-warning-500 fill-warning-500' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <Textarea placeholder="تعليقك (اختياري)" value={comment} onChange={(e) => setComment(e.target.value)} />
              <Button size="sm" onClick={submitReview}>إرسال التقييم</Button>
            </div>
        )}
        <div className="space-y-3">
          {(reviews ?? []).map((r) => (
            <div key={r.id} className="card text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{r.user?.name || 'عميل'}</span>
                <span className="text-warning-500">{'★'.repeat(r.rating)}</span>
              </div>
              {r.comment && <p className="text-gray-600">{r.comment}</p>}
            </div>
          ))}
          {!reviews?.length && <p className="text-gray-500 text-sm">لا توجد تقييمات</p>}
        </div>
      </section>
    </div>
  );
}
