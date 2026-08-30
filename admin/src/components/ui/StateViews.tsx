import { RefreshCw } from 'lucide-react';

export function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card h-28">
          <div className="skeleton h-4 w-20 mb-2" />
          <div className="skeleton h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="empty-state card">{message}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-state card">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn-secondary mt-4" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 ml-2" /> إعادة المحاولة
        </button>
      )}
    </div>
  );
}
