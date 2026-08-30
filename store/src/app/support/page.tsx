'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeApi } from '@/lib/store-api';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { getErrorMessage } from '@/lib/utils';
import { useToastStore } from '@/stores/toast-store';

export default function SupportPage() {
  return (
    <AuthGuard>
      <SupportContent />
    </AuthGuard>
  );
}

function SupportContent() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const toast = useToastStore((s) => s.show);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['support'],
    queryFn: storeApi.getSupportMessages,
  });

  const sendMessage = useMutation({
    mutationFn: () => storeApi.sendSupportMessage({ subject, message }),
    onSuccess: () => {
      setSubject('');
      setMessage('');
      toast('تم إرسال الرسالة', 'success');
      qc.invalidateQueries({ queryKey: ['support'] });
    },
    onError: (e) => toast(getErrorMessage(e), 'error'),
  });

  const messages = data ?? [];

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">الدعم</h1>

      <div className="card mb-6 space-y-3">
        <Input placeholder="الموضوع" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Textarea placeholder="رسالتك..." value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
        <Button
          loading={sendMessage.isPending}
          disabled={!subject.trim() || !message.trim()}
          onClick={() => sendMessage.mutate()}
        >
          إرسال
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : messages.length === 0 ? (
        <EmptyState title="لا توجد رسائل" description="ابدأ محادثة مع فريق الدعم" />
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`card text-sm ${m.isAdmin ? 'bg-primary-50 mr-4' : 'ml-4'}`}
            >
              <p className="font-medium text-xs text-gray-500 mb-1">
                {m.isAdmin ? 'الإدارة' : 'أنت'} — {new Date(m.createdAt).toLocaleString('ar-EG')}
              </p>
              <p className="font-medium">{m.subject}</p>
              <p className="text-gray-700 mt-1">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
