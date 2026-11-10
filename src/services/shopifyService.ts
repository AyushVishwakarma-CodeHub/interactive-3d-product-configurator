import { ProductConfig, TENT_SIZES, FRAME_FINISHES } from '../types/config';
import { PricingBreakdown } from '../types/pricing';
import { ShopifyCartLineItem, ShopifyCartState } from '../types/shopify';
import { postMessageBridge } from './postMessageBridge';

export class ShopifyService {
  private static instance: ShopifyService;
  private cart: ShopifyCartState;
  private listeners: Set<(cart: ShopifyCartState) => void> = new Set();

  private constructor() {
    this.cart = {
      items: [],
      itemCount: 0,
      totalPrice: 0,
      currency: 'USD',
      token: `shptkn_${Math.random().toString(36).substring(2, 10)}`,
      checkoutUrl: 'https://demo-canopy-store.myshopify.com/checkout',
    };
  }

  public static getInstance(): ShopifyService {
    if (!ShopifyService.instance) {
      ShopifyService.instance = new ShopifyService();
    }
    return ShopifyService.instance;
  }

  public getCart(): ShopifyCartState {
    return this.cart;
  }

  public subscribe(cb: (cart: ShopifyCartState) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    this.cart.itemCount = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
    this.cart.totalPrice = this.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    for (const listener of this.listeners) {
      listener({ ...this.cart });
    }
  }

  /**
   * Adds the configured 3D product to the Shopify cart with line-item properties.
   */
  public addToCart(
    config: ProductConfig,
    pricing: PricingBreakdown,
    previewThumbnail: string,
    quantity: number = 1
  ): ShopifyCartLineItem {
    const sizeDef = TENT_SIZES.find((s) => s.id === config.size) || TENT_SIZES[0];
    const finishDef = FRAME_FINISHES.find((f) => f.id === config.frameFinish) || FRAME_FINISHES[0];
    const orderQty = Math.max(1, Math.floor(quantity || pricing.quantity || 1));
    const unitPrice = pricing.unitPrice || (pricing.totalPrice / orderQty);

    // Determine customized faces
    const customizedFaces = Object.entries(config.sections)
      .filter(([_, sec]) => sec.layers.length > 0 || (!config.useGlobalColor && sec.backgroundColor !== '#FFFFFF'))
      .map(([_, sec]) => sec.label);

    const accessoriesList = Object.entries(config.accessories)
      .filter(([_, active]) => active)
      .map(([key]) => {
        if (key === 'rollerBag') return 'Roller Bag';
        if (key === 'sandbags') return 'Sandbags (4x)';
        if (key === 'heavyDutyStakes') return 'Ground Stakes';
        if (key === 'flagMounts') return 'Flag Brackets';
        return key;
      });

    // Create Shopify line item properties
    const properties: Record<string, string> = {
      _configId: config.id,
      _configJSON: JSON.stringify(config),
      Size: sizeDef.label,
      'Frame Finish': finishDef.label,
      'Base Canopy Color': config.globalColor,
      'Customized Zones': customizedFaces.length > 0 ? customizedFaces.join(', ') : 'None (Solid Canopy)',
      Accessories: accessoriesList.length > 0 ? accessoriesList.join(', ') : 'None',
      'Order Quantity': `${orderQty} Unit(s)`,
      'Unit Price': `$${unitPrice.toFixed(2)} USD`,
      'Calculated Subtotal': `$${pricing.totalPrice.toFixed(2)} USD`,
      'Lead Time': `${pricing.leadTimeDays} Business Days`,
    };

    const lineItem: ShopifyCartLineItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `Custom ${sizeDef.label} Event Canopy Tent (Dye-Sublimated)`,
      variantTitle: `${sizeDef.label} / ${finishDef.label}`,
      sku: `TENT-${config.size.replace('.', '_')}-${config.frameFinish.toUpperCase()}`,
      price: unitPrice,
      quantity: orderQty,
      properties,
      featuredImage: previewThumbnail,
    };

    this.cart.items.unshift(lineItem);
    this.notify();

    // Send payload to host if inside an iframe
    postMessageBridge.emit('ADD_TO_SHOPIFY_CART', {
      lineItem,
      cart: this.cart,
      config,
    });

    return lineItem;
  }

  public removeItem(itemId: string): void {
    this.cart.items = this.cart.items.filter((i) => i.id !== itemId);
    this.notify();
  }

  public updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }
    const item = this.cart.items.find((i) => i.id === itemId);
    if (item) {
      item.quantity = quantity;
      this.notify();
    }
  }

  public clearCart(): void {
    this.cart.items = [];
    this.notify();
  }
}

export const shopifyService = ShopifyService.getInstance();

