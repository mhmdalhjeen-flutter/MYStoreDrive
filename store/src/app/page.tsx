'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { storeApi } from '@/lib/store-api';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { StoreClosedBanner } from '@/components/store/StoreStatus';
import { Button } from '@/components/ui/Button';
import { Megaphone, Tag, Star } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/stores/toast-store';
import { getErrorMessage } from '@/lib/utils';
import type { Product } from '@/lib/types';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const toast = useToastStore((s) => s.show);

  const { data: status } = useQuery({
    queryKey: ['store-status'],
    queryFn: storeApi.getStoreStatus,
  });

  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn: storeApi.getAnnouncements,
  });

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: storeApi.getCategories,
  });

  const { data: recommended, isLoading: recLoading } = useQuery({
    queryKey: ['recommended'],
    queryFn: storeApi.getRecommended,
  });

  const { data: offers, isLoading: offLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: storeApi.getOffers,
  });

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    try {
      await storeApi.addToCart(product.id, 1);
      toast('تمت الإضافة إلى السلة', 'success');
    } catch (e) {
      toast(getErrorMessage(e), 'error');
    }
  };

  return (
    <div>
      <StoreClosedBanner />
      <section className="bg-gradient-to-b from-primary-50 to-white py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
            {status?.isOpen === false ? 'المتجر مغلق مؤقتاً' : 'مرحباً بك في متجرنا'}
          </h1>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            تسوق بسهولة مع توصيل لمنطقتك واستمتع بعروض التوصيل المجاني
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/products"><Button size="lg">تصفح المنتجات</Button></Link>
            <Link href="/search"><Button size="lg" variant="outline">بحث</Button></Link>
          </div>
        </div>
      </section>

      {announcements && announcements.length > 0 && (
        <section className="container mx-auto px-4 py-4">
          <div className="space-y-2">
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="card flex gap-3 items-start bg-primary-50/50">
                <Megaphone className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{a.content}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/announcements" className="text-sm text-primary-600 mt-2 inline-block">جميع الإعلانات ←</Link>
        </section>
      )}

      <section className="container mx-auto px-4 py-6">
        <h2 className="text-xl font-bold mb-4">التصنيفات</h2>
        {catLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-10 w-24 shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {(categories ?? []).filter((c) => !c.parentId).map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="shrink-0 px-4 py-2 bg-white border rounded-xl hover:border-primary-300 text-sm font-medium"
              >
                {c.name}
              </Link>
            ))}
            <Link href="/categories" className="shrink-0 px-4 py-2 text-primary-600 text-sm">عرض الكل</Link>
          </div>
        )}
      </section>

      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Star className="w-5 h-5 text-warning-500" /> موصى به</h2>
          <Link href="/products" className="text-sm text-primary-600">المزيد</Link>
        </div>
        {recLoading ? <ProductGridSkeleton count={4} /> : (
          <ProductGrid products={recommended ?? []} onAddToCart={handleAddToCart} />
        )}
      </section>

      <section className="container mx-auto px-4 py-6 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Tag className="w-5 h-5 text-error-500" /> العروض</h2>
        </div>
        {offLoading ? <ProductGridSkeleton count={4} /> : (
          <ProductGrid products={offers ?? []} onAddToCart={handleAddToCart} />
        )}
      </section>
    </div>
  );
}
