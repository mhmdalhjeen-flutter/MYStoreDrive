'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import type { Category } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { ActiveBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/stores/toast-store';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', parentId: '', isActive: true });
  const toast = useToast((s) => s.show);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCategories(await adminApi.getCategories());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ name: '', slug: '', description: '', parentId: '', isActive: true });
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (c: Category) => {
    setEditId(c.id);
    setForm({ name: c.name, slug: c.slug, description: c.description ?? '', parentId: c.parentId ?? '', isActive: c.isActive });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      parentId: form.parentId || undefined,
      isActive: form.isActive,
    };
    try {
      if (editId) {
        await adminApi.updateCategory(editId, payload);
        toast('تم تحديث التصنيف', 'success');
      } else {
        await adminApi.createCategory(payload);
        toast('تم إنشاء التصنيف', 'success');
      }
      resetForm();
      load();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  const toggleActive = async (c: Category) => {
    try {
      if (c.isActive) await adminApi.deactivateCategory(c.id);
      else await adminApi.activateCategory(c.id);
      toast(c.isActive ? 'تم إلغاء التفعيل' : 'تم التفعيل', 'success');
      load();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteCategory(deleteId);
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
        title="التصنيفات"
        action={
          <button type="button" className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="w-4 h-4 ml-2" /> تصنيف جديد
          </button>
        }
      />

      {showForm && (
        <form onSubmit={submit} className="card mb-4 max-w-lg space-y-3">
          <h2 className="font-bold">{editId ? 'تعديل التصنيف' : 'تصنيف جديد'}</h2>
          <input className="input" placeholder="الاسم" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input ltr-input" dir="ltr" placeholder="slug" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <textarea className="input" placeholder="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select className="input" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
            <option value="">بدون تصنيف أب</option>
            {categories.filter((c) => c.id !== editId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> نشط</label>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">حفظ</button>
            <button type="button" className="btn-secondary" onClick={resetForm}>إلغاء</button>
          </div>
        </form>
      )}

      {loading && <div className="card skeleton h-48" />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && categories.length === 0 && <EmptyState message="لا توجد تصنيفات" />}

      {!loading && !error && categories.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="table">
            <thead><tr><th>الاسم</th><th>Slug</th><th>الأب</th><th>الحالة</th><th>إجراءات</th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.name}</td>
                  <td className="ltr-input" dir="ltr">{c.slug}</td>
                  <td>{categories.find((p) => p.id === c.parentId)?.name ?? '—'}</td>
                  <td><ActiveBadge active={c.isActive} /></td>
                  <td className="whitespace-nowrap">
                    <button type="button" className="text-primary-600 text-sm ml-2" onClick={() => openEdit(c)}>تعديل</button>
                    <button type="button" className="text-warning-600 text-sm ml-2" onClick={() => toggleActive(c)}>{c.isActive ? 'إلغاء تفعيل' : 'تفعيل'}</button>
                    <button type="button" className="text-error-600 text-sm" onClick={() => setDeleteId(c.id)}>حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="حذف التصنيف" message="هل أنت متأكد من حذف هذا التصنيف؟" danger confirmLabel="حذف" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
