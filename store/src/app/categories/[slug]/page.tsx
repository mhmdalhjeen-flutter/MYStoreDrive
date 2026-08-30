'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { storeApi } from '@/lib/store-api';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/stores/toast-store';
import { getErrorMessage } from '@/lib/utils';
import type { Product } from '@/lib/types';

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const toast = useToastStore((s) => s.show);

  const { data: category, isLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => storeApi.getCategoryBySlug(slug),
    enabled: !!slug,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products-category', category?.id],
    queryFn: () => storeApi.getProducts({ categoryId: category!.id, limit: 24 }),
    enabled: !!category?.id,
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

  if (isLoading) return <div className="container mx-auto px-4 py-6"><ProductGridSkeleton /></div>;
  if (!category) return <div className="container mx-auto px-4 py-10 text-center">التصنيف غير موجود</div>;

  const products = productsData?.products ?? category.products ?? [];

  return (
    <div className="container mx-auto px-4 py-6">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/categories">التصنيفات</Link> / <span>{category.name}</span>
      </nav>
      <h1 className="text-2xl font-bold mb-2">{category.name}</h1>
      {category.description && <p className="text-gray-600 mb-6">{category.description}</p>}
      {category.children && category.children.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mb-6">
          {category.children.map((ch) => (
            <Link key={ch.id} href={`/categories/${ch.slug}`} className="shrink-0 px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
              {ch.name}
            </Link>
          ))}
        </div>
      )}
      {productsLoading ? <ProductGridSkeleton /> : (
        <ProductGrid products={products} onAddToCart={handleAddToCart} />
      )}
    </div>
  );
}
