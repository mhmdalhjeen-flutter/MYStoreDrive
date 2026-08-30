'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { storeApi } from '@/lib/store-api';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/stores/toast-store';
import { getErrorMessage } from '@/lib/utils';
import type { Product } from '@/lib/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const toast = useToastStore((s) => s.show);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => storeApi.searchProducts(debounced),
    enabled: debounced.length >= 2,
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

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">بحث</h1>
      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="ابحث عن منتج..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-10"
        />
      </div>
      {debounced.length < 2 && <p className="text-gray-500 text-sm">اكتب حرفين على الأقل للبحث</p>}
      {isFetching && <p className="text-sm text-gray-500">جاري البحث...</p>}
      {data && (
        data.length === 0 ? (
          <p className="text-gray-500">لا توجد نتائج لـ &quot;{debounced}&quot;</p>
        ) : (
          <ProductGrid products={data} onAddToCart={handleAddToCart} />
        )
      )}
    </div>
  );
}
