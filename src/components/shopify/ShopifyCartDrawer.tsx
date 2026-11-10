import React, { useEffect, useState } from 'react';
import { shopifyService } from '../../services/shopifyService';
import { ShopifyCartState, ShopifyCartLineItem } from '../../types/shopify';
import { useUIStore } from '../../store/useUIStore';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export const ShopifyCartDrawer: React.FC = () => {
  const shopifyCartOpen = useUIStore((s) => s.shopifyCartOpen);
  const setShopifyCartOpen = useUIStore((s) => s.setShopifyCartOpen);
  const setCheckoutModalOpen = useUIStore((s) => s.setCheckoutModalOpen);

  const [cart, setCart] = useState<ShopifyCartState>(shopifyService.getCart());

  useEffect(() => {
    const unsubscribe = shopifyService.subscribe((updatedCart) => {
      setCart(updatedCart);
    });
    return unsubscribe;
  }, []);

  if (!shopifyCartOpen) return null;

  const handleCheckout = () => {
    setShopifyCartOpen(false);
    setCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setShopifyCartOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Shopify Cart ({cart.itemCount})
              </h2>
            </div>
            <button
              onClick={() => setShopifyCartOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {cart.items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <ShoppingBag className="w-12 h-12 stroke-1 mb-2 text-slate-600" />
                <p className="text-sm font-medium text-slate-300">Your cart is empty</p>
                <p className="text-xs text-slate-500 mt-1">
                  Configure your 3D canopy and click &quot;Add to Shopify Cart&quot;
                </p>
              </div>
            ) : (
              cart.items.map((item: ShopifyCartLineItem) => (
                <div
                  key={item.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-3 shadow-md"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {item.featuredImage ? (
                        <img
                          src={item.featuredImage}
                          alt={item.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-slate-500" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-bold text-white leading-tight">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => shopifyService.removeItem(item.id)}
                          className="text-slate-500 hover:text-red-400 p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-[11px] font-medium text-blue-400 block mt-0.5">
                        {item.variantTitle}
                      </span>
                      <span className="text-xs font-mono font-bold text-white mt-1 block">
                        ${(item.price * item.quantity).toFixed(2)} USD
                      </span>
                    </div>
                  </div>

                  {/* Shopify Line Item Properties (Customization Metadata) */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 flex flex-col gap-1 text-[10px]">
                    <span className="font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Custom Line Item Properties:
                    </span>
                    {Object.entries(item.properties).map(([k, v]) => {
                      if (k.startsWith('_')) return null; // internal hidden properties
                      return (
                        <div key={k} className="flex items-start justify-between text-slate-300">
                          <span className="font-medium text-slate-400">{k}:</span>
                          <span className="font-semibold text-slate-200 text-right max-w-[190px] truncate">
                            {v}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quantity adjustment */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400">Quantity</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => shopifyService.updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold font-mono text-white px-1">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => shopifyService.updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout CTA */}
          {cart.items.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-400">Total Price</span>
                <span className="font-black text-xl text-white font-mono">
                  ${cart.totalPrice.toFixed(2)} USD
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Custom line-item attributes formatted for Shopify Cart API</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-transform active:scale-[0.98]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
