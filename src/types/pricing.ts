export interface PriceItem {
  id: string;
  name: string;
  category: 'base' | 'printing' | 'finish' | 'accessory' | 'discount';
  unitPrice: number;
  quantity: number;
  total: number;
  description?: string;
}

export interface PricingBreakdown {
  currency: string;
  currencySymbol: string;
  quantity: number;
  unitPrice: number;
  basePrice: number;
  printingSubtotal: number;
  finishSurcharge: number;
  accessoriesSubtotal: number;
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  estimatedTax: number;
  shipping: number;
  totalPrice: number;
  items: PriceItem[];
  leadTimeDays: number;
  calculatedAt: string;
}

export interface PricingRequestPayload {
  size: string;
  frameFinish: string;
  customizedSectionsCount: number;
  logoUploadsCount: number;
  textLayersCount: number;
  accessories: {
    rollerBag: boolean;
    sandbags: boolean;
    heavyDutyStakes: boolean;
    flagMounts: boolean;
  };
  discountCode?: string;
}

