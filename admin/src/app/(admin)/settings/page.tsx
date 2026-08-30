'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin-api';
import type { Settings } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/StateViews';
import { useToast } from '@/stores/toast-store';

export default function SettingsPage() {
  const toast = useToast((s) => s.show);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    storeName: '',
    isStoreOpen: true,
    storeClosedMessage: '',
    freeDeliveryTarget: '',
    partialFreeDeliveryEnabled: false,
    partialFreeDeliveryThreshold: '',
    partialFreeDeliveryDiscount: '0',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await adminApi.getSettings();
      setForm({
        storeName: s.storeName,
        isStoreOpen: s.isStoreOpen,
        storeClosedMessage: s.storeClosedMessage ?? '',
        freeDeliveryTarget: String(s.freeDeliveryTarget),
        partialFreeDeliveryEnabled: s.partialFreeDeliveryEnabled,
        partialFreeDeliveryThreshold: String(s.partialFreeDeliveryThreshold),
        partialFreeDeliveryDiscount: String(s.partialFreeDeliveryDiscount),
      });
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateSettings({
        storeName: form.storeName,
        isStoreOpen: form.isStoreOpen,
        storeClosedMessage: form.storeClosedMessage || undefined,
        freeDeliveryTarget: parseFloat(form.freeDeliveryTarget),
        partialFreeDeliveryEnabled: form.partialFreeDeliveryEnabled,
        partialFreeDeliveryThreshold: parseFloat(form.partialFreeDeliveryThreshold),
        partialFreeDeliveryDiscount: parseInt(form.partialFreeDeliveryDiscount, 10),
      });
      toast('تم حفظ الإعدادات', 'success');
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card skeleton h-96" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <PageHeader title="إعدادات المتجر" />
      <form onSubmit={submit} className="card max-w-2xl space-y-4">
        <div className="p-4 rounded-xl border-2 border-dashed flex items-center justify-between">
          <div>
            <p className="font-bold">{form.isStoreOpen ? 'المتجر مفتوح' : 'المتجر مغلق'}</p>
            <p className="text-sm text-gray-500">تحكم في حالة المتجر للعملاء</p>
          </div>
          <button
            type="button"
            className={form.isStoreOpen ? 'btn-danger' : 'btn-primary'}
            onClick={() => setForm({ ...form, isStoreOpen: !form.isStoreOpen })}
          >
            {form.isStoreOpen ? 'إغلاق المتجر' : 'فتح المتجر'}
          </button>
        </div>

        <Field label="اسم المتجر">
          <input className="input" required value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
        </Field>
        <Field label="رسالة الإغلاق">
          <textarea className="input" value={form.storeClosedMessage} onChange={(e) => setForm({ ...form, storeClosedMessage: e.target.value })} placeholder="تظهر للعملاء عند إغلاق المتجر" />
        </Field>
        <Field label="هدف التوصيل المجاني (₪)">
          <input type="number" step="0.01" min="0.01" className="input ltr-input" dir="ltr" required value={form.freeDeliveryTarget} onChange={(e) => setForm({ ...form, freeDeliveryTarget: e.target.value })} />
        </Field>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.partialFreeDeliveryEnabled} onChange={(e) => setForm({ ...form, partialFreeDeliveryEnabled: e.target.checked })} />
          تفعيل التوصيل المجاني الجزئي
        </label>
        {form.partialFreeDeliveryEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="حد التوصيل الجزئي (₪)">
              <input type="number" step="0.01" min="0.01" className="input ltr-input" dir="ltr" value={form.partialFreeDeliveryThreshold} onChange={(e) => setForm({ ...form, partialFreeDeliveryThreshold: e.target.value })} />
            </Field>
            <Field label="نسبة الخصم (%)">
              <input type="number" min="0" max="100" className="input ltr-input" dir="ltr" value={form.partialFreeDeliveryDiscount} onChange={(e) => setForm({ ...form, partialFreeDeliveryDiscount: e.target.value })} />
            </Field>
          </div>
        )}
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</button>
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
