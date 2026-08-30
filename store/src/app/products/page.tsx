'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { storeApi } from '@/lib/store-api';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/stores/toast-store';
import { getErrorMessage } from '@/lib/utils';
import { Suspense, useState } from 'react';
import type { Product } from '@/lib/types';

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const [page, setPage] = useState(1);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const toast = useToastStore((s) => s.show);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', page, categoryId],
    queryFn: () => storeApi.getProducts({ page, limit: 12, categoryId }),
  });

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    try {
      await storeApi.addToCart(product.id, 1);
      toast('تمت الإضافة إلى السلة', 'success');
    } catch (e) {
      toast(getErrorMessage(e), 'error');
    }
  };

  const totalPages = data ? Math.ceil(data.total / (data.pageSize || 12)) : 1;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">المنتجات</h1>
      {isLoading ? (
        <ProductGridSkeleton />
      ) : (
        <>
          <ProductGrid products={data?.products ?? []} onAddToCart={handleAddToCart} />
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="outline" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>
                السابق
              </Button>
              <span className="flex items-center px-3 text-sm">{page} / {totalPages}</span>
              <Button variant="outline" disabled={page >= totalPages || isFetching} onClick={() => setPage((p) => p + 1)}>
                التالي
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-6"><ProductGridSkeleton /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
