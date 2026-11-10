import React, { useState } from 'react';
import { useConfiguratorStore } from '../../store/useConfiguratorStore';
import { useUIStore } from '../../store/useUIStore';
import { usePricingStore } from '../../store/usePricingStore';
import { TENT_SIZES, TentSize } from '../../types/config';
import {
  Undo2,
  Redo2,
  RotateCcw,
  ShoppingBag,
  FileDown,
  Columns2,
  Box,
  Palette,
  Code2,
  Sparkles,
  Star,
  ShieldCheck,
  Flame,
  Zap,
} from 'lucide-react';
import { shopifyService } from '../../services/shopifyService';
import { pdfService } from '../../services/pdfService';
import { globalTextureCompositor } from '../../engine/TextureCompositor';
import { JsonInspectorModal } from './JsonInspectorModal';
import { BRAND_TEMPLATES, applyTemplateToConfig } from '../../utils/brandTemplates';

interface HeaderProps {
  get3DSnapshot?: () => string | undefined;
}

export const Header: React.FC<HeaderProps> = ({ get3DSnapshot }) => {
  const currentSize = useConfiguratorStore((s) => s.config.size);
  const setSize = useConfiguratorStore((s) => s.setSize);
  const undo = useConfiguratorStore((s) => s.undo);
  const redo = useConfiguratorStore((s) => s.redo);
  const canUndo = useConfiguratorStore((s) => s.canUndo());
  const canRedo = useConfiguratorStore((s) => s.canRedo());
  const reset = useConfiguratorStore((s) => s.resetConfiguration);
  const config = useConfiguratorStore((s) => s.config);
  const loadConfiguration = useConfiguratorStore((s) => s.loadConfiguration);

  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const setShopifyCartOpen = useUIStore((s) => s.setShopifyCartOpen);
  const showToast = useUIStore((s) => s.showToast);

  const pricing = usePricingStore((s) => s.pricing);
  const cartItemCount = shopifyService.getCart().itemCount;

  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  const handleApplyTemplate = (tmplId: string) => {
    const tmpl = BRAND_TEMPLATES.find((t) => t.id === tmplId);
    if (!tmpl) return;
    const updated = applyTemplateToConfig(config, tmpl);
    loadConfiguration(updated);
    setIsTemplatesOpen(false);
    showToast(`Loaded template: ${tmpl.name}`);
  };

  const handleExportPDF = async () => {
    if (!pricing) return;
    showToast('Exporting production summary PDF...');
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
          customerName: 'Vertical 3D Tech Reviewer',
          companyName: 'Canopy Configurator Demo',
        }
      );
      pdfService.downloadPDF(blob, `Canopy_Tent_${config.size}_Spec.pdf`);
      showToast('PDF downloaded successfully!');
    } catch (e) {
      console.error(e);
      showToast('Failed to export PDF');
    }
  };

  return (
    <>
      <header className="bg-slate-950 border-b border-slate-800 z-30 select-none flex flex-col">
        {/* Top Mini Commercial Bar (Breadcrumb + Commercial Guarantee Trust Badges) */}
        <div className="hidden md:flex items-center justify-between px-4 py-1 bg-slate-900/80 border-b border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Commercial Pop-Up Tents</span>
            <span className="text-slate-600">/</span>
            <span className="font-semibold text-slate-200">Custom Heavy-Duty Canopy Tent</span>
            <span className="text-slate-600">/</span>
            <span className="text-blue-400 font-bold">Interactive 3D Configurator</span>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-semibold">
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>4.9 / 5 Rating (1,240+ Reviews)</span>
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <Flame className="w-3 h-3 text-red-400" />
              <span>CPAI-84 Fire Certified</span>
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Lifetime Frame Warranty</span>
            </span>
            <span className="flex items-center gap-1 text-blue-300">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>2-Day Turnaround Available</span>
            </span>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="h-14 px-4 flex items-center justify-between">
          {/* 1. Left: Brand Title & Size Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Box className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-wider text-white">MVP VISUALS</span>
                  <span className="text-[9px] font-black px-1.5 py-0.2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                    3D STUDIO
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:block font-medium">
                  Custom 10x10 / Hex Aluminum Canopy
                </span>
              </div>
            </div>

            {/* Size Selector Quick Pills */}
            <div className="hidden xl:flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
              {TENT_SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSize(size.id as TentSize)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    currentSize === size.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>

            {/* 1-Click Brand Templates Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Brand Presets</span>
              </button>

              {isTemplatesOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">
                    1-Click Sample Themes
                  </span>
                  {BRAND_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => handleApplyTemplate(tmpl.id)}
                      className="p-2 rounded-lg text-left hover:bg-slate-800 transition-colors flex items-center gap-2.5"
                    >
                      <span
                        style={{ backgroundColor: tmpl.accentColor }}
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/20"
                      />
                      <div className="flex-1 overflow-hidden">
                        <span className="text-xs font-bold text-white block truncate">{tmpl.name}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{tmpl.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. Center: View Mode (Split / 3D / 2D) & History Controls */}
          <div className="flex items-center gap-2">
            {/* Undo / Redo / Reset */}
            <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
              <button
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Undo2 className="w-4 h-4" />
              </button>

              <button
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Redo2 className="w-4 h-4" />
              </button>

              <button
                onClick={reset}
                title="Reset Default Tent"
                className="p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
                  viewMode === 'split' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split Studio</span>
              </button>

              <button
                onClick={() => setViewMode('3d')}
                className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
                  viewMode === '3d' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">3D Studio</span>
              </button>

              <button
                onClick={() => setViewMode('2d')}
                className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
                  viewMode === '2d' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">2D Proof</span>
              </button>
            </div>
          </div>

          {/* 3. Right: JSON Schema Inspector, Export PDF & Shopify Cart Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsJsonModalOpen(true)}
              title="Inspect Structured Configuration JSON Schema"
              className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden xl:inline">JSON</span>
            </button>

            <button
              onClick={handleExportPDF}
              title="Export Production Spec Sheet PDF"
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Spec PDF</span>
            </button>

            <button
              onClick={() => setShopifyCartOpen(true)}
              className="relative px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Shopify Cart</span>
              {cartItemCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-emerald-950 text-[10px] font-black flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <JsonInspectorModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
      />
    </>
  );
};
