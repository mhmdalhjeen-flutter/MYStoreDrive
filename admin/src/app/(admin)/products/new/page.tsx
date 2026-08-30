'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import type { Category, ProductAvailability, ProductVariant } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/stores/toast-store';

const AVAIL_OPTIONS: ProductAvailability[] = ['LIMITED', 'UNLIMITED', 'UNAVAILABLE'];

export default function NewProductPage() {
  const router = useRouter();
  const toast = useToast((s) => s.show);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
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
    adminApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminApi.uploadProductImage(file);
      setImages((prev) => [...prev, res.url]);
      toast('تم رفع الصورة', 'success');
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setUploading(false);
    }
  };

  const addVariant = () => setVariants((v) => [...v, { name: '', value: '', type: 'size', stock: 0, priceAdjustment: 0 }]);
  const updateVariant = (i: number, field: keyof ProductVariant, val: string | number) => {
    setVariants((arr) => arr.map((v, idx) => (idx === i ? { ...v, [field]: val } : v)));
  };
  const removeVariant = (i: number) => setVariants((arr) => arr.filter((_, idx) => idx !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.createProduct({
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
      toast('تم إنشاء المنتج', 'success');
      router.push('/products');
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="منتج جديد" />
      <form onSubmit={submit} className="card max-w-2xl space-y-4">
        <Field label="اسم المنتج"><input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="الوصف"><textarea className="input min-h-[100px]" required value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
        <Field label="التصنيف">
          <select className="input" required value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
            <option value="">اختر تصنيفاً</option>
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
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isAvailable} onChange={(e) => set('isAvailable', e.target.checked)} /> متاح في المتجر</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isRecommended} onChange={(e) => set('isRecommended', e.target.checked)} /> منتج موصى به</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.hasOffer} onChange={(e) => set('hasOffer', e.target.checked)} /> عرض</label>
        </div>
        <Field label="الصور">
          <input type="file" accept="image/*" onChange={handleImage} disabled={uploading} />
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((url) => <Image key={url} src={url} alt="" width={64} height={64} className="rounded-lg object-cover w-16 h-16" />)}
          </div>
        </Field>
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">المتغيرات</span>
            <button type="button" className="btn-secondary text-sm" onClick={addVariant}>إضافة متغير</button>
          </div>
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2">
              <input className="input" placeholder="الاسم" value={v.name} onChange={(e) => updateVariant(i, 'name', e.target.value)} />
              <input className="input" placeholder="القيمة" value={v.value} onChange={(e) => updateVariant(i, 'value', e.target.value)} />
              <input className="input" placeholder="النوع" value={v.type} onChange={(e) => updateVariant(i, 'type', e.target.value)} />
              <input type="number" className="input ltr-input" placeholder="المخزون" value={v.stock ?? 0} onChange={(e) => updateVariant(i, 'stock', parseInt(e.target.value, 10))} />
              <button type="button" className="text-error-600 text-sm" onClick={() => removeVariant(i)}>حذف</button>
            </div>
          ))}
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ المنتج'}</button>
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
