'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import type { Category, Product, ProductAvailability, ProductVariant } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/StateViews';
import { useToast } from '@/stores/toast-store';

const AVAIL_OPTIONS: ProductAvailability[] = ['LIMITED', 'UNLIMITED', 'UNAVAILABLE'];

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast((s) => s.show);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    freeDeliveryValue: '0',
    availability: 'UNLIMITED' as ProductAvailability,
    stock: '0',
    isAvailable: true,
    isRecommended: false,
    hasOffer: false,
  });

  useEffect(() => {
    Promise.all([adminApi.getProduct(id), adminApi.getCategories()])
      .then(([product, cats]) => {
        setCategories(cats);
        fillForm(product);
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const fillForm = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description,
      categoryId: p.categoryId,
      price: String(p.price),
      freeDeliveryValue: String(p.freeDeliveryValue ?? 0),
      availability: p.availability,
      stock: String(p.stock ?? 0),
      isAvailable: p.isAvailable,
      isRecommended: p.isRecommended,
      hasOffer: p.hasOffer ?? false,
    });
    setImages(p.images ?? []);
    setVariants(p.variants ?? []);
  };

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await adminApi.uploadProductImage(file);
      setImages((prev) => [...prev, res.url]);
      toast('تم رفع الصورة', 'success');
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateProduct(id, {
        name: form.name,
        description: form.description,
        categoryId: form.categoryId,
        price: parseFloat(form.price),
        freeDeliveryValue: parseFloat(form.freeDeliveryValue) || 0,
        availability: form.availability,
        stock: form.availability === 'LIMITED' ? parseInt(form.stock, 10) : 0,
        isAvailable: form.isAvailable,
        isRecommended: form.isRecommended,
        hasOffer: form.hasOffer,
        images,
        variants: variants.filter((v) => v.name && v.value),
      });
      toast('تم تحديث المنتج', 'success');
      router.push('/products');
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card skeleton h-96" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="تعديل المنتج" />
      <form onSubmit={submit} className="card max-w-2xl space-y-4">
        <Field label="اسم المنتج"><input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="الوصف"><textarea className="input min-h-[100px]" required value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
        <Field label="التصنيف">
          <select className="input" required value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="السعر (₪)"><input type="number" step="0.01" min="0" className="input ltr-input" dir="ltr" required value={form.price} onChange={(e) => set('price', e.target.value)} /></Field>
          <Field label="قيمة التوصيل المجاني"><input type="number" step="0.01" min="0" className="input ltr-input" dir="ltr" value={form.freeDeliveryValue} onChange={(e) => set('freeDeliveryValue', e.target.value)} /></Field>
        </div>
        <Field label="نوع التوفر">
          <select className="input" value={form.availability} onChange={(e) => set('availability', e.target.value)}>
            {AVAIL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        {form.availability === 'LIMITED' && (
          <Field label="الكمية"><input type="number" min="0" className="input ltr-input" dir="ltr" value={form.stock} onChange={(e) => set('stock', e.target.value)} /></Field>
        )}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isAvailable} onChange={(e) => set('isAvailable', e.target.checked)} /> متاح</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isRecommended} onChange={(e) => set('isRecommended', e.target.checked)} /> موصى به</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.hasOffer} onChange={(e) => set('hasOffer', e.target.checked)} /> عرض</label>
        </div>
        <Field label="الصور">
          <input type="file" accept="image/*" onChange={handleImage} />
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((url) => <Image key={url} src={url} alt="" width={64} height={64} className="rounded-lg object-cover w-16 h-16" />)}
          </div>
        </Field>
        {variants.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">المتغيرات</p>
            {variants.map((v, i) => (
              <div key={i} className="text-sm text-gray-600 mb-1">{v.name}: {v.value} ({v.type}) — مخزون: {v.stock ?? 0}</div>
            ))}
          </div>
        )}
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}
