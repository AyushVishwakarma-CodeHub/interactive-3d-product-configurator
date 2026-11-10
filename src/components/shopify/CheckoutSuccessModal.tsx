import React, { useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useConfiguratorStore } from '../../store/useConfiguratorStore';
import { usePricingStore } from '../../store/usePricingStore';
import { shopifyService } from '../../services/shopifyService';
import { pdfService } from '../../services/pdfService';
import { globalTextureCompositor } from '../../engine/TextureCompositor';
import { fireConfetti } from '../../utils/confetti';
import { CheckCircle, Download, ShoppingBag, X } from 'lucide-react';

interface CheckoutSuccessModalProps {
  get3DSnapshot?: () => string | undefined;
}

export const CheckoutSuccessModal: React.FC<CheckoutSuccessModalProps> = ({ get3DSnapshot }) => {
  const checkoutModalOpen = useUIStore((s) => s.checkoutModalOpen);
  const setCheckoutModalOpen = useUIStore((s) => s.setCheckoutModalOpen);
  const showToast = useUIStore((s) => s.showToast);

  const config = useConfiguratorStore((s) => s.config);
  const pricing = usePricingStore((s) => s.pricing);

  useEffect(() => {
    if (checkoutModalOpen) {
      fireConfetti();
    }
  }, [checkoutModalOpen]);

  if (!checkoutModalOpen) return null;

  const orderNumber = `ORD-SHP-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleDownloadPDF = async () => {
    if (!pricing) return;
    showToast('Generating official production PDF order receipt...');

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
        customerName: 'Vertical 3D Tech Reviewer',
        companyName: 'Official Shopify Order Confirmation',
      }
    );

    pdfService.downloadPDF(blob, `Shopify_Order_${orderNumber}_Spec.pdf`);
    showToast('Downloaded production PDF!');
  };

  const handleClose = () => {
    shopifyService.clearCart();
    setCheckoutModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative flex flex-col gap-4 text-center">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-1">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-xl font-black text-white">Order Placed Successfully!</h3>
          <p className="text-xs text-slate-400 mt-1">
            Shopify Order Reference: <strong className="text-emerald-400 font-mono">{orderNumber}</strong>
          </p>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-left text-xs flex flex-col gap-2">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Total Charged:</span>
            <span className="font-bold font-mono text-white">${pricing?.totalPrice.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Config ID:</span>
            <span className="font-mono text-[11px] text-blue-400">{config.id}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Production Turnaround:</span>
            <span className="font-semibold text-emerald-400">2-Day Dye-Sublimation</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Shopify Webhook:</span>
            <span className="text-emerald-400 font-semibold">Line Items & Properties Attached</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          The customized 3D design specifications and high-resolution print vectors have been
          packaged into the production queue.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-2">
          <button
            onClick={handleDownloadPDF}
            className="w-full sm:flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Production Spec PDF</span>
          </button>

          <button
            onClick={handleClose}
            className="w-full sm:flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>New Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};

