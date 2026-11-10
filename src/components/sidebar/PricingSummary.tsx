import React, { useState } from 'react';
import { usePricingStore } from '../../store/usePricingStore';
import { useConfiguratorStore } from '../../store/useConfiguratorStore';
import { useUIStore } from '../../store/useUIStore';
import { shopifyService } from '../../services/shopifyService';
import { pdfService } from '../../services/pdfService';
import { globalTextureCompositor } from '../../engine/TextureCompositor';
import { fireConfetti } from '../../utils/confetti';
import {
  ShoppingCart,
  FileText,
  Tag,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Truck,
} from 'lucide-react';

interface PricingSummaryProps {
  get3DSnapshot?: () => string | undefined;
}

export const PricingSummary: React.FC<PricingSummaryProps> = ({ get3DSnapshot }) => {
  const pricing = usePricingStore((s) => s.pricing);
  const isLoading = usePricingStore((s) => s.isLoading);
  const activeDiscountCode = usePricingStore((s) => s.activeDiscountCode);
  const setDiscountCode = usePricingStore((s) => s.setDiscountCode);
  const fetchPricing = usePricingStore((s) => s.fetchPricing);
  const quantity = usePricingStore((s) => s.quantity);
  const setQuantity = usePricingStore((s) => s.setQuantity);

  const config = useConfiguratorStore((s) => s.config);
  const setShopifyCartOpen = useUIStore((s) => s.setShopifyCartOpen);
  const prevStep = useUIStore((s) => s.prevStep);
  const showToast = useUIStore((s) => s.showToast);

  const [inputCode, setInputCode] = useState(activeDiscountCode);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleQuantityChange = (delta: number) => {
    const nextQty = Math.max(1, Math.min(100, quantity + delta));
    setQuantity(nextQty);
    setTimeout(() => {
      fetchPricing(useConfiguratorStore.getState().config);
    }, 10);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setDiscountCode(inputCode);
    fetchPricing(config);
    showToast(`Applied coupon: ${inputCode.toUpperCase()}`);
  };

  const handleAddToCart = () => {
    if (!pricing) return;

    // Grab 3D snapshot if available, otherwise flat proof
    const thumbnail = get3DSnapshot?.() || globalTextureCompositor.getSectionDataURL('front_peak', config);
    shopifyService.addToCart(config, pricing, thumbnail, quantity);
    setShopifyCartOpen(true);
    fireConfetti();
    showToast(`Added ${quantity}x custom canopy to Shopify Cart!`);
  };

  const handleExportPDF = async () => {
    if (!pricing) return;
    setIsExportingPDF(true);
    showToast('Generating Production Specification PDF...');

    try {
      const render3D = get3DSnapshot?.();
      const flatProof = globalTextureCompositor.getFullTextureProofURL();

      const blob = await pdfService.generateProductionPDF(
        config,
        pricing,
        { render3D, flatProof },
        {
          include3DSnapshots: true,
          includePrintProofs: true,
          includePriceBreakdown: true,
          customerName: 'Vertical 3D Tech Assessment Reviewer',
          companyName: 'Vertical 3D Tech Commercial Store',
        }
      );

      pdfService.downloadPDF(blob, `Canopy_Tent_Spec_${config.size}_${Date.now()}.pdf`);
      showToast('PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Error generating PDF');
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (!pricing) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
        <span className="text-xs">Connecting to Dynamic Pricing API...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/40 border border-blue-500/30 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Step 5: Review & Pricing Summary
          </span>
          <span className="text-[10px] font-extrabold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
            Commercial Quote
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1 font-medium">
          Transparent, dynamic pricing calculated in real time. Free virtual 3D/2D proof before production.
        </p>
      </div>

      {/* Dynamic Price Banner */}
      <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/40 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
            Total Dynamic Price
          </span>
          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 2-Day Turnaround Available
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-black text-white tracking-tight">
            ${pricing.totalPrice.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 font-medium">USD</span>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-400 ml-1" />}
        </div>

        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
          Complete commercial setup: custom dye-sub printed canopy, 40mm hexagonal frame, and selected accessories.
        </p>
      </div>

      {/* Quantity Stepper & Tier Volume Discounts */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-md">
        <div>
          <span className="text-xs font-bold text-white block">Order Quantity</span>
          <span className="text-[10px] text-slate-400">
            {quantity >= 5
              ? '🔥 10% Wholesale volume discount applied'
              : quantity >= 3
              ? '✨ 5% Tier discount applied'
              : 'Add 3+ units for 5% off, 5+ units for 10% off'}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white font-bold flex items-center justify-center transition-colors"
            title="Decrease quantity"
          >
            -
          </button>
          <span className="w-8 text-center font-mono font-bold text-white text-sm">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(1)}
            className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors"
            title="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Itemized Breakdown Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2 uppercase tracking-wider">
          Itemized Production Bill
        </span>

        <div className="flex flex-col gap-1.5 text-xs">
          {pricing.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between py-0.5 text-slate-300">
              <div className="flex-1 pr-2">
                <span className="font-medium text-slate-200">{item.name}</span>
                {item.quantity > 1 && (
                  <span className="text-slate-500 ml-1">x{item.quantity}</span>
                )}
              </div>
              <span
                className={`font-mono font-bold ${
                  item.total < 0 ? 'text-red-400' : 'text-slate-200'
                }`}
              >
                {item.total < 0 ? `-$${Math.abs(item.total).toFixed(2)}` : `$${item.total.toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-2 flex flex-col gap-1 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="font-mono">${pricing.subtotal.toFixed(2)}</span>
          </div>

          {pricing.discountAmount > 0 && (
            <div className="flex justify-between text-red-400 font-semibold">
              <span>Promotional Discount</span>
              <span className="font-mono">-${pricing.discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-400">
            <span>Estimated Sales Tax (8.25%)</span>
            <span className="font-mono">${pricing.estimatedTax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              Standard Ground Shipping
            </span>
            <span className="font-mono font-bold text-emerald-400">
              {pricing.shipping === 0 ? 'FREE' : `$${pricing.shipping.toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Coupon Code Input */}
      <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Try coupon VERTICAL10"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 uppercase font-mono focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors"
        >
          Apply
        </button>
      </form>

      {/* MVP Visuals Trust & Quality Guarantee Seals */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1.5 text-[11px] text-slate-300">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>MVP Visuals Quality Guarantee</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          Every canopy is built with commercial flame-retardant 600D polyester and an aircraft-grade aluminum frame. You will receive a high-resolution production proof for sign-off prior to printing.
        </p>
      </div>

      {/* Primary Action Buttons: Add to Cart & Export PDF */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={handleAddToCart}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.01]"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add Custom Tent to Shopify Cart</span>
        </button>

        <button
          onClick={handleExportPDF}
          disabled={isExportingPDF}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {isExportingPDF ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          ) : (
            <FileText className="w-4 h-4 text-amber-400" />
          )}
          <span>Download Production Spec Sheet & Proof (PDF)</span>
        </button>

        <button
          onClick={prevStep}
          className="w-full py-2 bg-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Step 4: Accessories</span>
        </button>
      </div>
    </div>
  );
};
