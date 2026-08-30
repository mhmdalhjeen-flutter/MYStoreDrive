import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from './api';
import type {
  Announcement,
  AuthTokens,
  CartResponse,
  Category,
  DeliveryArea,
  Favorite,
  Order,
  PaginatedProducts,
  PaymentSettings,
  Product,
  Review,
  ReviewSummary,
  StoreStatus,
  SupportMessage,
  User,
} from './types';

export const storeApi = {
  // Auth
  sendOtp: (phoneNumber: string) =>
    apiPost<{ message: string }>('/auth/send-otp', { phoneNumber }),
  verifyOtp: (phoneNumber: string, code: string) =>
    apiPost<{ user: User } & AuthTokens>('/auth/verify-otp', { phoneNumber, code }),

  // Store
  getStoreStatus: () => apiGet<StoreStatus>('/settings/store-status'),
  getPublicSettings: () => apiGet<Record<string, unknown>>('/settings'),
  getPaymentSettings: () => apiGet<PaymentSettings>('/settings/payment'),

  // Categories
  getCategories: () => apiGet<Category[]>('/categories'),
  getCategoryBySlug: (slug: string) => apiGet<Category>(`/categories/slug/${slug}`),

  // Products
  getProducts: (params?: { page?: number; limit?: number; categoryId?: string }) =>
    apiGet<PaginatedProducts>('/products', params),
  getProduct: (id: string) => apiGet<Product>(`/products/${id}`),
  searchProducts: (q: string) => apiGet<Product[]>('/products/search', { q }),
  getRecommended: () => apiGet<Product[]>('/products/recommended'),
  getOffers: () => apiGet<Product[]>('/products/offers'),

  // Cart
  getCart: (deliveryAreaId?: string) =>
    apiGet<CartResponse>('/cart', deliveryAreaId ? { deliveryAreaId } : undefined),
  addToCart: (productId: string, quantity: number, variantId?: string) =>
    apiPost('/cart/items', { productId, quantity, variantId }),
  updateCartItem: (id: string, quantity: number) =>
    apiPut(`/cart/items/${id}`, { quantity }),
  removeCartItem: (id: string) => apiDelete(`/cart/items/${id}`),
  clearCart: () => apiDelete('/cart'),

  // Delivery
  getDeliveryAreas: () => apiGet<DeliveryArea[]>('/delivery/areas'),

  // Orders
  createOrder: (data: { deliveryAreaId: string; deliveryAddress: string; notes?: string }) =>
    apiPost<Order>('/orders', data),
  getOrders: () => apiGet<Order[]>('/orders'),
  getOrder: (id: string) => apiGet<Order>(`/orders/${id}`),
  submitPayment: (
    orderId: string,
    data: { paymentReference: string; paymentNotes?: string; paymentProof?: string },
  ) => apiPost<Order>(`/orders/${orderId}/payment`, data),

  // Favorites
  getFavorites: () => apiGet<Favorite[]>('/favorites'),
  addFavorite: (productId: string) => apiPost(`/favorites/${productId}`),
  removeFavorite: (productId: string) => apiDelete(`/favorites/${productId}`),
  getFavoriteStatus: (productId: string) =>
    apiGet<{ isFavorite: boolean }>(`/favorites/${productId}/status`),

  // Reviews
  getProductReviews: (productId: string) =>
    apiGet<Review[]>(`/reviews/product/${productId}`),
  getReviewSummary: (productId: string) =>
    apiGet<ReviewSummary>(`/reviews/product/${productId}/summary`),
  createReview: (productId: string, data: { rating: number; comment?: string }) =>
    apiPost(`/reviews/product/${productId}`, data),
  deleteReview: (productId: string) => apiDelete(`/reviews/product/${productId}`),

  // Announcements
  getAnnouncements: () => apiGet<Announcement[]>('/announcements'),

  // Support
  getSupportMessages: () => apiGet<SupportMessage[]>('/support/messages'),
  sendSupportMessage: (data: { subject: string; message: string; orderId?: string }) =>
    apiPost<SupportMessage>('/support/messages', data),

  // Profile
  getProfile: () => apiGet<User>('/users/profile'),
  updateProfile: (data: { name?: string; email?: string }) =>
    apiPut<User>('/users/profile', data),

  // Upload
  uploadPaymentProof: (file: File) =>
    apiUpload<{ url: string; key: string }>('/upload/payment-proof', file),
};
