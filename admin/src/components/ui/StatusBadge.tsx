import { ORDER_STATUS_AR, PAYMENT_STATUS_AR } from '@/lib/utils';

export function PaymentBadge({ status }: { status: string }) {
  const cls =
    status === 'VERIFIED' ? 'badge-success' :
    status === 'REJECTED' ? 'badge-error' :
    status === 'SUBMITTED' ? 'badge-warning' : 'badge-info';
  return <span className={cls}>{PAYMENT_STATUS_AR[status] ?? status}</span>;
}

export function OrderBadge({ status }: { status: string }) {
  const cls =
    status === 'CONFIRMED' || status === 'DELIVERED' ? 'badge-success' :
    status === 'CANCELLED' || status === 'PAYMENT_REJECTED' ? 'badge-error' :
    status === 'PENDING' ? 'badge-warning' : 'badge-info';
  return <span className={cls}>{ORDER_STATUS_AR[status] ?? status}</span>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return active ? <span className="badge-success">نشط</span> : <span className="badge-error">غير نشط</span>;
}
