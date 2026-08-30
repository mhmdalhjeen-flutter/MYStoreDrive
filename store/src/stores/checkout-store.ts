'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CheckoutState {
  deliveryAreaId: string | null;
  setDeliveryAreaId: (id: string | null) => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      deliveryAreaId: null,
      setDeliveryAreaId: (id) => set({ deliveryAreaId: id }),
    }),
    { name: 'store-checkout' },
  ),
);
