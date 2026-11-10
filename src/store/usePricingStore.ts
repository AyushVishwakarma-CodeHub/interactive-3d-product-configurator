import { create } from 'zustand';
import { PricingBreakdown } from '../types/pricing';
import { ProductConfig } from '../types/config';
import { pricingService } from '../services/pricingService';

interface PricingStore {
  pricing: PricingBreakdown | null;
  isLoading: boolean;
  error: string | null;
  activeDiscountCode: string;
  quantity: number;
  abortController: AbortController | null;

  setQuantity: (qty: number) => void;
  setDiscountCode: (code: string) => void;
  fetchPricing: (config: ProductConfig) => Promise<void>;
}

export const usePricingStore = create<PricingStore>((set, get) => ({
  pricing: null,
  isLoading: false,
  error: null,
  activeDiscountCode: '',
  quantity: 1,
  abortController: null,

  setQuantity: (qty: number) => {
    const validQty = Math.max(1, Math.min(100, Math.floor(qty || 1)));
    set({ quantity: validQty });
  },

  setDiscountCode: (code: string) => {
    set({ activeDiscountCode: code });
  },

  fetchPricing: async (config: ProductConfig) => {
    // Abort previous in-flight request if any
    const prevController = get().abortController;
    if (prevController) {
      prevController.abort();
    }

    const controller = new AbortController();
    set({ isLoading: true, error: null, abortController: controller });

    try {
      const breakdown = await pricingService.calculatePrice(
        config,
        get().activeDiscountCode,
        get().quantity,
        controller.signal
      );
      set({ pricing: breakdown, isLoading: false, abortController: null });
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        // Ignored, newer request took over
        return;
      }
      set({
        error: (err as Error)?.message || 'Failed to calculate price',
        isLoading: false,
        abortController: null,
      });
    }
  },
}));

