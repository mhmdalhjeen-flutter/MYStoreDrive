export type ProductAvailability = 'LIMITED' | 'UNLIMITED' | 'UNAVAILABLE';
export type OrderStatus = string;
export type PaymentStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

export interface AdminUser {
  id: string;
  email?: string | null;
  name?: string | null;
  role: string;
}

export interface AnalyticsOverview {
  totalOrders: number;
  ordersToday: number;
  totalCustomers: number;
  productCount: number;
  availableProducts: number;
  outOfStockProducts: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingPayments: number;
  confirmedOrders: number;
  rejectedPayments: number;
  favoritesCount: number;
  unreadSupport: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string | number;
  freeDeliveryValue: string | number;
  availability: ProductAvailability;
  stock: number;
  isAvailable: boolean;
  isActive: boolean;
  isRecommended: boolean;
  categoryId: string;
  category?: { id: string; name: string };
  images: string[];
  hasOffer?: boolean;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id?: string;
  name: string;
  value: string;
  type: string;
  priceAdjustment?: number;
  stock?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  parentId?: string | null;
  children?: Category[];
}

export interface DeliveryArea {
  id: string;
  name: string;
  deliveryFee: string | number;
  eligibleForFreeDelivery: boolean;
  isActive: boolean;
}

export interface Settings {
  id: string;
  storeName: string;
  isStoreOpen: boolean;
  storeClosedMessage?: string | null;
  freeDeliveryTarget: string | number;
  partialFreeDeliveryEnabled: boolean;
  partialFreeDeliveryThreshold: string | number;
  partialFreeDeliveryDiscount: number;
  paymentInstructions?: string | null;
  paymentAccountDetails?: string | null;
  paymentQrImage?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: string | number;
  deliveryFee: string | number;
  total: string | number;
  deliveryAddress: string;
  paymentReference?: string | null;
  paymentProof?: string | null;
  paymentNotes?: string | null;
  adminPaymentNotes?: string | null;
  createdAt: string;
  items: OrderItem[];
  customer?: { id: string; name?: string | null; phoneNumber: string };
  deliveryArea?: { id: string; name: string };
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: string | number;
  freeDeliveryValue: string | number;
  variantInfo?: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  priority: number;
  startDate: string;
  endDate?: string | null;
}

export interface SupportMessage {
  id: string;
  userId: string;
  subject: string;
  message: string;
  isAdmin: boolean;
  isRead: boolean;
  createdAt: string;
  user?: { id: string; name?: string | null; phoneNumber: string };
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: { id: string; name?: string | null; phoneNumber: string };
  product?: { id: string; name: string };
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}
