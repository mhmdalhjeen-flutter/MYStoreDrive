'use client';

import { useToast } from '@/stores/toast-store';

export function ToastBar() {
  const { message, type, clear } = useToast();
  if (!message) return null;
  const colors = {
    success: 'bg-success-600',
    error: 'bg-error-600',
    info: 'bg-primary-600',
  };
  return (
    <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[100] ${colors[type]} text-white px-4 py-3 rounded-xl shadow-lg text-sm flex justify-between`}>
      <span>{message}</span>
      <button type="button" onClick={clear}>×</button>
    </div>
  );
}
