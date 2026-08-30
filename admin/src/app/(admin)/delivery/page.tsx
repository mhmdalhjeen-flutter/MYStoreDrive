'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import type { DeliveryArea } from '@/lib/types';
import { formatPrice, getErrorMessage } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { ActiveBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/stores/toast-store';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function DeliveryPage() {
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', deliveryFee: '', eligibleForFreeDelivery: true, isActive: true });
  const toast = useToast((s) => s.show);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAreas(await adminApi.getDeliveryAreas());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ name: '', deliveryFee: '', eligibleForFreeDelivery: true, isActive: true });
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (a: DeliveryArea) => {
    setEditId(a.id);
    setForm({
      name: a.name,
      deliveryFee: String(a.deliveryFee),
      eligibleForFreeDelivery: a.eligibleForFreeDelivery,
      isActive: a.isActive,
    });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      deliveryFee: parseFloat(form.deliveryFee),
      eligibleForFreeDelivery: form.eligibleForFreeDelivery,
      isActive: form.isActive,
    };
    try {
      if (editId) {
        await adminApi.updateDeliveryArea(editId, payload);
        toast('تم التحديث', 'success');
      } else {
        await adminApi.createDeliveryArea(payload);
        toast('تم الإنشاء', 'success');
      }
      resetForm();
      load();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  const toggleActive = async (a: DeliveryArea) => {
    try {
      if (a.isActive) await adminApi.deactivateDeliveryArea(a.id);
      else await adminApi.activateDeliveryArea(a.id);
      toast('تم التحديث', 'success');
      load();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteDeliveryArea(deleteId);
      toast('تم الحذف', 'success');
      setDeleteId(null);
      load();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="مناطق التوصيل"
        action={
          <button type="button" className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="w-4 h-4 ml-2" /> منطقة جديدة
          </button>
        }
      />

      {showForm && (
        <form onSubmit={submit} className="card mb-4 max-w-lg space-y-3">
          <h2 className="font-bold">{editId ? 'تعديل المنطقة' : 'منطقة جديدة'}</h2>
          <input className="input" placeholder="اسم المنطقة" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="number" step="0.01" min="0" className="input ltr-input" dir="ltr" placeholder="رسوم التوصيل" required value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })} />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.eligibleForFreeDelivery} onChange={(e) => setForm({ ...form, eligibleForFreeDelivery: e.target.checked })} /> مؤهل للتوصيل المجاني</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> نشط</label>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">حفظ</button>
            <button type="button" className="btn-secondary" onClick={resetForm}>إلغاء</button>
          </div>
        </form>
      )}

      {loading && <div className="card skeleton h-48" />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && areas.length === 0 && <EmptyState message="لا توجد مناطق توصيل" />}

      {!loading && !error && areas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {areas.map((a) => (
            <div key={a.id} className="card">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">{a.name}</h3>
                <ActiveBadge active={a.isActive} />
              </div>
              <p className="text-sm text-gray-600">رسوم التوصيل: {formatPrice(a.deliveryFee)} ₪</p>
              <p className="text-sm text-gray-600">{a.eligibleForFreeDelivery ? 'مؤهل للتوصيل المجاني' : 'غير مؤهل للتوصيل المجاني'}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" className="text-primary-600 text-sm" onClick={() => openEdit(a)}>تعديل</button>
                <button type="button" className="text-warning-600 text-sm" onClick={() => toggleActive(a)}>{a.isActive ? 'إلغاء تفعيل' : 'تفعيل'}</button>
                <button type="button" className="text-error-600 text-sm" onClick={() => setDeleteId(a.id)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="حذف المنطقة" message="هل أنت متأكد؟" danger confirmLabel="حذف" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
