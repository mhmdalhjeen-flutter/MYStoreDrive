'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { storeApi } from '@/lib/store-api';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: storeApi.getCategories,
  });

  const roots = (data ?? []).filter((c) => !c.parentId);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">التصنيفات</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {roots.map((c) => (
            <Link key={c.id} href={`/categories/${c.slug}`} className="card hover:shadow-card-hover text-center py-6">
              <p className="font-medium">{c.name}</p>
              {c._count && <p className="text-xs text-gray-500 mt-1">{c._count.products} منتج</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
