'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { adminApi } from '@/lib/admin-api';
import type { Settings } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/StateViews';
import { useToast } from '@/stores/toast-store';

export default function PaymentPage() {
  const toast = useToast((s) => s.show);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    paymentInstructions: '',
    paymentAccountDetails: '',
    paymentQrImage: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await adminApi.getSettings();
      setForm({
        paymentInstructions: s.paymentInstructions ?? '',
        paymentAccountDetails: s.paymentAccountDetails ?? '',
        paymentQrImage: s.paymentQrImage ?? '',
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
        paymentInstructions: form.paymentInstructions,
        paymentAccountDetails: form.paymentAccountDetails,
        paymentQrImage: form.paymentQrImage || undefined,
      });
      toast('تم حفظ إعدادات الدفع', 'success');
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminApi.uploadPaymentQr(file);
      setForm((f) => ({ ...f, paymentQrImage: res.url }));
      toast('تم رفع رمز QR', 'success');
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="card skeleton h-96" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <PageHeader title="إعدادات الدفع اليدوي" />
      <form onSubmit={submit} className="card max-w-2xl space-y-4">
        <p className="text-sm text-gray-500">لا يوجد بوابة دفع إلكترونية — يتم الدفع يدوياً عبر التحويل البنكي.</p>
        <Field label="تعليمات الدفع">
          <textarea className="input min-h-[120px]" value={form.paymentInstructions} onChange={(e) => setForm({ ...form, paymentInstructions: e.target.value })} placeholder="تعليمات للعميل حول كيفية الدفع" />
        </Field>
        <Field label="تفاصيل الحساب">
          <textarea className="input min-h-[80px]" value={form.paymentAccountDetails} onChange={(e) => setForm({ ...form, paymentAccountDetails: e.target.value })} placeholder="رقم الحساب، اسم البنك، إلخ" />
        </Field>
        <Field label="رمز QR للدفع">
          <input type="file" accept="image/*" onChange={handleQrUpload} disabled={uploading} />
          {form.paymentQrImage && (
            <div className="mt-2">
              <Image src={form.paymentQrImage} alt="QR" width={160} height={160} className="rounded-xl" />
            </div>
          )}
        </Field>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
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
