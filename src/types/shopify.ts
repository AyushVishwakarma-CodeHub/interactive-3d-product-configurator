export interface ShopifyLineItemProperty {
  name: string;
  value: string;
}

export interface ShopifyCartLineItem {
  id: string; // e.g., variant_5x5_custom
  title: string;
  variantTitle: string;
  sku: string;
  price: number; // in cents or dollars (e.g. 549.00)
  quantity: number;
  properties: Record<string, string>;
  featuredImage: string;
}

export interface ShopifyCartState {
  items: ShopifyCartLineItem[];
  itemCount: number;
  totalPrice: number;
  currency: string;
  token: string;
  checkoutUrl: string;
}

export type ConfiguratorPostMessageType =
  | 'CONFIGURATOR_READY'
  | 'CONFIGURATOR_UPDATED'
  | 'ADD_TO_SHOPIFY_CART'
  | 'REQUEST_SNAPSHOT'
  | 'SNAPSHOT_READY'
  | 'REQUEST_PDF'
  | 'RESIZE_FRAME'
  | 'SET_CONFIG'
  | 'SET_SIZE'
  | 'SET_FRAME_FINISH'
  | 'SET_GLOBAL_COLOR';

export interface ConfiguratorPostMessage<T = unknown> {
  type: ConfiguratorPostMessageType;
  payload: T;
  source: 'VERTICAL_3D_CONFIGURATOR' | 'PARENT_HOST';
  version: string;
}

