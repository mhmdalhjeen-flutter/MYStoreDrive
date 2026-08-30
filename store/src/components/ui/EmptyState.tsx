'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      <p className="text-lg font-medium text-gray-700 mb-1">{title}</p>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-state">
      <p className="font-medium mb-2">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-primary text-sm">
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
