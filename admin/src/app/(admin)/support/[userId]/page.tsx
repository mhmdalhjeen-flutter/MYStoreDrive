'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminApi } from '@/lib/admin-api';
import type { SupportMessage } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/StateViews';
import { useToast } from '@/stores/toast-store';

export default function SupportThreadPage() {
  const { userId } = useParams<{ userId: string }>();
  const toast = useToast((s) => s.show);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const thread = await adminApi.getSupportThread(userId);
      setMessages(thread);
      await adminApi.markSupportRead(userId);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await adminApi.replySupport(userId, reply.trim(), messages[0]?.subject);
      setReply('');
      toast('تم إرسال الرد', 'success');
      load();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setSending(false);
    }
  };

  const customer = messages.find((m) => !m.isAdmin)?.user;

  if (loading) return <div className="card skeleton h-96" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <PageHeader title={`محادثة — ${customer?.name ?? customer?.phoneNumber ?? 'عميل'}`} />
      <div className="card space-y-3 mb-4 max-h-[60vh] overflow-y-auto">
        {messages.map((m) => (
          <div key={m.id} className={`p-3 rounded-xl text-sm ${m.isAdmin ? 'bg-primary-50 mr-8' : 'bg-gray-100 ml-8'}`}>
            <p className="text-xs text-gray-500 mb-1">{m.isAdmin ? 'الإدارة' : 'العميل'} · {new Date(m.createdAt).toLocaleString('ar')}</p>
            <p>{m.message}</p>
          </div>
        ))}
      </div>
      <form onSubmit={sendReply} className="card flex gap-2">
        <input className="input flex-1" placeholder="اكتب ردك..." value={reply} onChange={(e) => setReply(e.target.value)} />
        <button type="submit" className="btn-primary shrink-0" disabled={sending}>{sending ? '...' : 'إرسال'}</button>
      </form>
    </div>
  );
}
