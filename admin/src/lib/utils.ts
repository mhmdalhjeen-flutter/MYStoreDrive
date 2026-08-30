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

/** Login-specific messages — never reveal whether the email exists. */
export function getLoginErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as {
      response?: { status?: number; data?: { message?: string | string[] } };
      code?: string;
      message?: string;
    };
    if (!axiosError.response) {
      return 'تعذر الاتصال بالخادم، حاول مرة أخرى.';
    }
    const status = axiosError.response.status;
    if (status === 401 || status === 403) {
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    }
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    ((error as { code?: string }).code === 'ERR_NETWORK' ||
      (error as { code?: string }).code === 'ECONNABORTED')
  ) {
    return 'تعذر الاتصال بالخادم، حاول مرة أخرى.';
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
