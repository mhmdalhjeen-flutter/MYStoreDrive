export function formatPrice(v: string | number): string {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isNaN(n) ? '0.00' : n.toFixed(2);
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const msg = (error as { response?: { data?: { message?: string | string[] } } }).response?.data?.message;
    if (Array.isArray(msg)) return msg.join('، ');
    if (typeof msg === 'string') return msg;
  }
  return 'حدث خطأ غير متوقع';
}

export const ORDER_STATUS_AR: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  PAYMENT_SUBMITTED: 'تم إرسال الدفع',
  PAYMENT_VERIFIED: 'تم التحقق',
  PAYMENT_REJECTED: 'مرفوض',
  CONFIRMED: 'مؤكد',
  PROCESSING: 'قيد التجهيز',
  SHIPPED: 'تم الشحن',
  DELIVERED: 'تم التسليم',
  CANCELLED: 'ملغي',
};

export const PAYMENT_STATUS_AR: Record<string, string> = {
  PENDING: 'بانتظار الدفع',
  SUBMITTED: 'مُرسل',
  VERIFIED: 'مُحقق',
  REJECTED: 'مرفوض',
};

export const AVAILABILITY_AR: Record<string, string> = {
  LIMITED: 'محدود',
  UNLIMITED: 'غير محدود',
  UNAVAILABLE: 'غير متاح',
};
