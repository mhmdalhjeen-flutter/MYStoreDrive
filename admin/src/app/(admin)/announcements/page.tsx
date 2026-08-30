'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { adminApi } from '@/lib/admin-api';
import type { Announcement } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { ActiveBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/stores/toast-store';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', isActive: true, priority: '0', startDate: '', endDate: '' });
  const toast = useToast((s) => s.show);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await adminApi.getAnnouncements());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ title: '', content: '', isActive: true, priority: '0', startDate: '', endDate: '' });
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (a: Announcement) => {
    setEditId(a.id);
    setForm({
      title: a.title,
      content: a.content,
      isActive: a.isActive,
      priority: String(a.priority),
      startDate: a.startDate.slice(0, 10),
      endDate: a.endDate ? a.endDate.slice(0, 10) : '',
    });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      content: form.content,
      isActive: form.isActive,
      priority: parseInt(form.priority, 10),
      startDate: new Date(form.startDate),
      endDate: form.endDate ? new Date(form.endDate) : undefined,
    };
    try {
      if (editId) {
        await adminApi.updateAnnouncement(editId, payload);
        toast('تم التحديث', 'success');
      } else {
        await adminApi.createAnnouncement(payload);
        toast('تم الإنشاء', 'success');
      }
      resetForm();
      load();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteAnnouncement(deleteId);
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
        title="الإعلانات"
        action={
          <button type="button" className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="w-4 h-4 ml-2" /> إعلان جديد
          </button>
        }
      />

      {showForm && (
        <form onSubmit={submit} className="card mb-4 max-w-lg space-y-3">
          <h2 className="font-bold">{editId ? 'تعديل الإعلان' : 'إعلان جديد'}</h2>
          <input className="input" placeholder="العنوان" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="input min-h-[100px]" placeholder="المحتوى" required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <input type="number" className="input ltr-input" dir="ltr" placeholder="الأولوية" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className="input ltr-input" dir="ltr" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <input type="date" className="input ltr-input" dir="ltr" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> نشط</label>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">حفظ</button>
            <button type="button" className="btn-secondary" onClick={resetForm}>إلغاء</button>
          </div>
        </form>
      )}

      {loading && <div className="card skeleton h-48" />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && <EmptyState message="لا توجد إعلانات" />}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="card">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">{a.title}</h3>
                <ActiveBadge active={a.isActive} />
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{a.content}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(a.startDate).toLocaleDateString('ar')}{a.endDate ? ` — ${new Date(a.endDate).toLocaleDateString('ar')}` : ''}</p>
              <div className="mt-2 flex gap-2">
                <button type="button" className="text-primary-600 text-sm" onClick={() => openEdit(a)}>تعديل</button>
                <button type="button" className="text-error-600 text-sm" onClick={() => setDeleteId(a.id)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="حذف الإعلان" message="هل أنت متأكد؟" danger confirmLabel="حذف" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
