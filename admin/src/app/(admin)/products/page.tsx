'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import type { Product } from '@/lib/types';
import { AVAILABILITY_AR, formatPrice, getErrorMessage } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { ActiveBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/stores/toast-store';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast((s) => s.show);
  const limit = 10;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getProducts({ page, limit, includeInactive: true });
      let list = res.products;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter((p) => p.name.toLowerCase().includes(q));
      }
      setProducts(list);
      setTotal(res.total);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleDeactivate = async (id: string) => {
    try {
      await adminApi.deactivateProduct(id);
      toast('تم إلغاء تفعيل المنتج', 'success');
      load();
    } catch (e) {
      toast(getErrorMessage(e), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteProduct(deleteId);
      toast('تم حذف المنتج', 'success');
      setDeleteId(null);
      load();
    } catch (e) {
      toast(getErrorMessage(e), 'error');
    }
  };

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <PageHeader
        title="المنتجات"
        action={
          <Link href="/products/new" className="btn-primary">
            <Plus className="w-4 h-4 ml-2" /> منتج جديد
          </Link>
        }
      />

      <div className="card mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
          <input
            className="input pr-10"
            placeholder="بحث بالاسم..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {loading && <div className="card skeleton h-48" />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && products.length === 0 && <EmptyState message="لا توجد منتجات" />}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="hidden md:block card overflow-x-auto p-0">
            <table className="table">
              <thead>
                <tr>
                  <th>الصورة</th>
                  <th>الاسم</th>
                  <th>التصنيف</th>
                  <th>السعر</th>
                  <th>المخزون</th>
                  <th>التوفر</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt="" width={40} height={40} className="rounded-lg object-cover w-10 h-10" />
                      ) : '—'}
                    </td>
                    <td className="font-medium">{p.name}</td>
                    <td>{p.category?.name ?? '—'}</td>
                    <td>{formatPrice(p.price)} ₪</td>
                    <td>{p.availability === 'LIMITED' ? p.stock : AVAILABILITY_AR[p.availability]}</td>
                    <td>{AVAILABILITY_AR[p.availability]}</td>
                    <td><ActiveBadge active={p.isActive && p.isAvailable} /></td>
                    <td className="space-x-2 space-x-reverse whitespace-nowrap">
                      <Link href={`/products/${p.id}`} className="text-primary-600 text-sm">تعديل</Link>
                      {p.isActive && (
                        <button type="button" className="text-warning-600 text-sm mr-2" onClick={() => handleDeactivate(p.id)}>إلغاء تفعيل</button>
                      )}
                      <button type="button" className="text-error-600 text-sm mr-2" onClick={() => setDeleteId(p.id)}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {products.map((p) => (
              <div key={p.id} className="card flex gap-3">
                {p.images?.[0] && <Image src={p.images[0]} alt="" width={64} height={64} className="rounded-xl object-cover w-16 h-16 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-sm text-gray-500">{formatPrice(p.price)} ₪ · {p.category?.name}</p>
                  <div className="mt-2 flex gap-2">
                    <Link href={`/products/${p.id}`} className="text-primary-600 text-sm">تعديل</Link>
                    {p.isActive && <button type="button" className="text-warning-600 text-sm" onClick={() => handleDeactivate(p.id)}>إلغاء تفعيل</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button type="button" className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>السابق</button>
              <span className="py-2 text-sm">{page} / {pages}</span>
              <button type="button" className="btn-secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>التالي</button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="حذف المنتج"
        message="هل أنت متأكد؟ قد يفشل الحذف إذا كان المنتج مرتبطاً بطلبات سابقة."
        danger
        confirmLabel="حذف"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
