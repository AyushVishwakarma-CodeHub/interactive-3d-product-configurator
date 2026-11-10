import React from 'react';
import { useConfiguratorStore } from '../../store/useConfiguratorStore';
import { TENT_SIZES, TentSize } from '../../types/config';
import { Ruler, ShieldCheck, Flame, Sun, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const SizeOptions: React.FC = () => {
  const currentSize = useConfiguratorStore((s) => s.config.size);
  const setSize = useConfiguratorStore((s) => s.setSize);
  const nextStep = useUIStore((s) => s.nextStep);

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto">
      {/* Commercial Product Badge Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/40 border border-blue-500/30 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Step 1: Size & Setup
          </span>
          <span className="text-[10px] font-extrabold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
            Commercial Grade
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1 font-medium">
          Select your tent footprint. All sizes include commercial 600D dye-sublimated fabric and 40mm hexagonal hardware.
        </p>
      </div>

      {/* Package Type Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Ruler className="w-3.5 h-3.5 text-blue-400" />
          Choose Tent Footprint
        </label>

        <div className="flex flex-col gap-2.5">
          {TENT_SIZES.map((size) => {
            const isSelected = currentSize === size.id;
            const badge =
              size.id === '8x8'
                ? 'FULL EVENT COVERAGE'
                : size.id === '6.5x6.5'
                ? 'MOST POPULAR'
                : 'COMPACT BOOTH';

            return (
              <div
                key={size.id}
                onClick={() => setSize(size.id as TentSize)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/80 shadow-lg'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{size.label} Canopy</span>
                    <span
                      className={`text-[9px] font-black tracking-wide px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {badge}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-blue-400">${size.basePrice}</span>
                    <span className="block text-[10px] text-slate-500">Base Kit</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{size.dimensions}</p>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Includes Frame + Custom Top
                  </span>
                  <span className="text-blue-400 font-semibold flex items-center gap-1">
                    Instant 3D Preview
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Commercial Specification Highlights (from MVP Visuals) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Standard Equipment & Certifications
        </span>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
            <Flame className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>CPAI-84 & NFPA-701 Fire Retardant</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
            <Sun className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span>UPF 50+ UV Weather Shield</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>40mm Aircraft Aluminum Legs</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
            <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>Lifetime Frame Warranty</span>
          </div>
        </div>
      </div>

      {/* Next Step Action Button */}
      <button
        onClick={nextStep}
        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-all hover:scale-[1.01]"
      >
        <span>Proceed to Step 2: Frame Hardware</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

