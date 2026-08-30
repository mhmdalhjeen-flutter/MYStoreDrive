export type ProductAvailability = 'LIMITED' | 'UNLIMITED' | 'UNAVAILABLE';

export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_SUBMITTED'
  | 'PAYMENT_VERIFIED'
  | 'PAYMENT_REJECTED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  name?: string | null;
  email?: string | null;
  role: string;
  isPhoneVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  children?: Category[];
  products?: Product[];
  _count?: { products: number };
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  type: string;
  priceAdjustment: string | number;
  stock: number;
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
  images: string[];
  category?: Category;
  variants?: ProductVariant[];
  hasOffer?: boolean;
}

export interface CartItem {
  id: string;
  quantity: number;
  productId: string;
  variantId?: string | null;
  product: Product;
  variant?: ProductVariant | null;
}

export interface FreeDeliverySummary {
  actualScore: number;
  displayedScore: number;
  target: number;
  progressPercentage: number;
  partialEnabled: boolean;
  partialThreshold: number;
  partialDiscount: number;
  originalDeliveryFee: number;
  deliveryFee: number;
  deliveryDiscount: number;
  isFreeDelivery: boolean;
  isPartialFreeDelivery: boolean;
  areaEligibility: boolean | null;
  remainingScore: number;
  subtotal: number;
  totalItems: number;
  itemCount: number;
}

export interface CartResponse {
  items: CartItem[];
  summary: FreeDeliverySummary;
}

export interface DeliveryArea {
  id: string;
  name: string;
  deliveryFee: string | number;
  eligibleForFreeDelivery: boolean;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: string | number;
  freeDeliveryValue: string | number;
  variantInfo?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: string | number;
  deliveryFee: string | number;
  total: string | number;
  cartScore: string | number;
  deliveryAreaId: string;
  deliveryAddress: string;
  paymentReference?: string | null;
  paymentProof?: string | null;
  paymentNotes?: string | null;
  adminPaymentNotes?: string | null;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
  deliveryArea?: DeliveryArea;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: number;
  startDate: string;
  endDate?: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: { id: string; name?: string | null; phoneNumber?: string };
}

export interface ReviewSummary {
  averageRating: number;
  reviewCount: number;
}

export interface Favorite {
  id: string;
  productId: string;
  product: Product;
}

export interface SupportMessage {
  id: string;
  subject: string;
  message: string;
  isAdmin: boolean;
  isRead: boolean;
  orderId?: string | null;
  createdAt: string;
}

export interface PaymentSettings {
  paymentInstructions?: string | null;
  paymentAccountDetails?: string | null;
  paymentQrImage?: string | null;
}

export interface StoreStatus {
  isOpen: boolean;
  message?: string | null;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}
