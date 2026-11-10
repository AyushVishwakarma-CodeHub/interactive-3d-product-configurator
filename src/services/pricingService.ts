import { ProductConfig, TENT_SIZES, FRAME_FINISHES } from '../types/config';
import { PricingBreakdown, PriceItem } from '../types/pricing';

export class PricingService {
  private static instance: PricingService;

  public static getInstance(): PricingService {
    if (!PricingService.instance) {
      PricingService.instance = new PricingService();
    }
    return PricingService.instance;
  }

  /**
   * Simulates calling an external Pricing / CRM REST API (e.g. POST /api/v1/pricing/calculate).
   * Supports AbortSignal for debounced requests.
   */
  public async calculatePrice(
    config: ProductConfig,
    discountCode?: string,
    quantity: number = 1,
    signal?: AbortSignal
  ): Promise<PricingBreakdown> {
    // Simulate real-world network latency (120ms)
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 120);
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }
    });

    const items: PriceItem[] = [];
    const safeQty = Math.max(1, Math.floor(quantity || 1));

    // 1. Base Tent Variant
    const sizeDef = TENT_SIZES.find((s) => s.id === config.size) || TENT_SIZES[0];
    items.push({
      id: `item_base_${sizeDef.id}`,
      name: `${sizeDef.label} Heavy-Duty Commercial Canopy Tent`,
      category: 'base',
      unitPrice: sizeDef.basePrice,
      quantity: 1,
      total: sizeDef.basePrice,
      description: `${sizeDef.dimensions} with full aluminum truss frame`,
    });

    // 2. Frame Finish
    const finishDef = FRAME_FINISHES.find((f) => f.id === config.frameFinish) || FRAME_FINISHES[0];
    if (finishDef.surcharge > 0) {
      items.push({
        id: `item_finish_${finishDef.id}`,
        name: `Frame Finish Upgrade: ${finishDef.label}`,
        category: 'finish',
        unitPrice: finishDef.surcharge,
        quantity: 1,
        total: finishDef.surcharge,
        description: 'Powder-coated scratch-resistant commercial finish',
      });
    }

    // 3. Custom Printing Breakdown per section
    let printedPeaksCount = 0;
    let printedValancesCount = 0;
    let logoUploadsCount = 0;

    Object.entries(config.sections).forEach(([_secId, sec]) => {
      const hasContent = sec.layers.length > 0 || (!config.useGlobalColor && sec.backgroundColor !== '#FFFFFF');
      if (hasContent) {
        if (sec.category === 'peak') printedPeaksCount++;
        if (sec.category === 'valance') printedValancesCount++;
        logoUploadsCount += sec.layers.filter((l) => l.type === 'image').length;
      }
    });

    // First custom section is complimentary (standard MVP Visuals model: 1 free print location)
    const totalCustomLocations = printedPeaksCount + printedValancesCount;
    let extraLocationsCharged = Math.max(0, totalCustomLocations - 1);

    if (totalCustomLocations > 0) {
      items.push({
        id: 'item_print_complimentary',
        name: 'Full-Color Dye-Sublimation Print (Location 1)',
        category: 'printing',
        unitPrice: 0,
        quantity: 1,
        total: 0,
        description: 'Complimentary high-resolution dye-sub printing on primary face',
      });
    }

    if (extraLocationsCharged > 0) {
      const extraPrintCost = 40;
      items.push({
        id: 'item_print_extra_locations',
        name: `Additional Custom Printed Zones (${extraLocationsCharged}x)`,
        category: 'printing',
        unitPrice: extraPrintCost,
        quantity: extraLocationsCharged,
        total: extraLocationsCharged * extraPrintCost,
        description: 'Unlimited color dye-sublimation on additional peaks/valances',
      });
    }

    // Logo vectorization/setup fee if logos are uploaded
    if (logoUploadsCount > 0) {
      const setupFee = 25;
      items.push({
        id: 'item_print_setup',
        name: `Artwork Pre-Flight & Color Matching (${logoUploadsCount} logo${logoUploadsCount > 1 ? 's' : ''})`,
        category: 'printing',
        unitPrice: setupFee,
        quantity: 1,
        total: setupFee,
        description: 'Digital proofing, CMYK color calibration & print preparation',
      });
    }

    // 4. Accessories
    if (config.accessories.rollerBag) {
      items.push({
        id: 'item_acc_roller_bag',
        name: 'Deluxe Heavy-Duty Roller Transport Bag',
        category: 'accessory',
        unitPrice: 65,
        quantity: 1,
        total: 65,
        description: 'Reinforced dual-handle rolling case with all-terrain wheels',
      });
    }

    if (config.accessories.sandbags) {
      items.push({
        id: 'item_acc_sandbags',
        name: 'Commercial Weight Sandbag Set (4-Pack)',
        category: 'accessory',
        unitPrice: 40,
        quantity: 1,
        total: 40,
        description: 'Heavy 600D oxford weight bags (up to 120 lbs total ballast)',
      });
    }

    if (config.accessories.heavyDutyStakes) {
      items.push({
        id: 'item_acc_stakes',
        name: 'Steel Ground Stakes & Guy Line Tie-Downs',
        category: 'accessory',
        unitPrice: 25,
        quantity: 1,
        total: 25,
        description: 'High-tensile steel anchors for grass and dirt security',
      });
    }

    if (config.accessories.flagMounts) {
      items.push({
        id: 'item_acc_flag_mounts',
        name: 'Leg-Mounted Feather Flag Brackets (Pair)',
        category: 'accessory',
        unitPrice: 35,
        quantity: 1,
        total: 35,
        description: 'Quick-clamp universal flag pole mounting hardware',
      });
    }

    // Subtotals per single unit
    const basePrice = sizeDef.basePrice;
    const finishSurcharge = finishDef.surcharge;
    const printingSubtotal = items.filter((i) => i.category === 'printing').reduce((acc, i) => acc + i.total, 0);
    const accessoriesSubtotal = items.filter((i) => i.category === 'accessory').reduce((acc, i) => acc + i.total, 0);
    const unitPrice = basePrice + finishSurcharge + printingSubtotal + accessoriesSubtotal;
    const subtotal = unitPrice * safeQty;

    // Volume bulk discount logic
    let volumeDiscount = 0;
    if (safeQty >= 5) {
      volumeDiscount = Math.round(subtotal * 0.1);
      items.push({
        id: 'item_volume_discount_10',
        name: `Bulk Volume Discount (${safeQty}x units — 10% OFF)`,
        category: 'discount',
        unitPrice: -volumeDiscount,
        quantity: 1,
        total: -volumeDiscount,
        description: 'Tiered wholesale event volume incentive',
      });
    } else if (safeQty >= 3) {
      volumeDiscount = Math.round(subtotal * 0.05);
      items.push({
        id: 'item_volume_discount_5',
        name: `Bulk Volume Discount (${safeQty}x units — 5% OFF)`,
        category: 'discount',
        unitPrice: -volumeDiscount,
        quantity: 1,
        total: -volumeDiscount,
        description: 'Multi-canopy order tier discount',
      });
    }

    // Coupon discount code logic
    let promoDiscount = 0;
    let validDiscountCode = undefined;
    if (discountCode) {
      const codeUpper = discountCode.trim().toUpperCase();
      if (codeUpper === 'VERTICAL10' || codeUpper === 'MVP10') {
        promoDiscount = Math.round((subtotal - volumeDiscount) * 0.1);
        validDiscountCode = codeUpper;
        items.push({
          id: 'item_discount_10',
          name: `Promo Code Applied: ${codeUpper} (10% OFF)`,
          category: 'discount',
          unitPrice: -promoDiscount,
          quantity: 1,
          total: -promoDiscount,
          description: 'Special 10% assessment promotional discount',
        });
      }
    }

    const totalDiscount = volumeDiscount + promoDiscount;
    const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
    const estimatedTax = Math.round(discountedSubtotal * 0.0825); // 8.25% average US tax
    const shipping = subtotal > 750 ? 0 : 35; // Free shipping over $750
    const totalPrice = discountedSubtotal + estimatedTax + shipping;

    return {
      currency: 'USD',
      currencySymbol: '$',
      quantity: safeQty,
      unitPrice,
      basePrice,
      printingSubtotal,
      finishSurcharge,
      accessoriesSubtotal,
      subtotal,
      discountAmount: totalDiscount,
      discountCode: validDiscountCode,
      estimatedTax,
      shipping,
      totalPrice,
      items,
      leadTimeDays: 2, // Standard 2-day production as in MVP reference!
      calculatedAt: new Date().toISOString(),
    };
  }
}

export const pricingService = PricingService.getInstance();
