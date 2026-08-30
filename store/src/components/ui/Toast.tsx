'use client';

import { useToastStore } from '@/stores/toast-store';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm animate-in slide-in-from-bottom-2',
            t.type === 'success' && 'bg-success-600',
            t.type === 'error' && 'bg-error-600',
            t.type === 'info' && 'bg-primary-600',
          )}
        >
          <span>{t.message}</span>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="إغلاق">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
