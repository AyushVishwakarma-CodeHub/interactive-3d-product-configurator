import React from 'react';
import { useConfiguratorStore } from '../../store/useConfiguratorStore';
import { FRAME_FINISHES, FrameFinish } from '../../types/config';
import { ShieldCheck, Check, ArrowRight, ArrowLeft, Wrench, Layers } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const HardwareOptions: React.FC = () => {
  const currentFinish = useConfiguratorStore((s) => s.config.frameFinish);
  const setFrameFinish = useConfiguratorStore((s) => s.setFrameFinish);
  const nextStep = useUIStore((s) => s.nextStep);
  const prevStep = useUIStore((s) => s.prevStep);

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/40 border border-blue-500/30 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-blue-400" />
            Step 2: Frame Hardware & Finish
          </span>
          <span className="text-[10px] font-extrabold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
            Commercial 40mm
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1 font-medium">
          Choose your frame material finish. Built with heavy-duty 40mm hexagonal aircraft aluminum legs and cast aluminum joints.
        </p>
      </div>

      {/* Frame Finish Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Hexagonal Aluminum Frame Finish
        </label>

        <div className="flex flex-col gap-2.5">
          {FRAME_FINISHES.map((finish) => {
            const isSelected = currentFinish === finish.id;
            return (
              <div
                key={finish.id}
                onClick={() => setFrameFinish(finish.id as FrameFinish)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/80 shadow-lg'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{ backgroundColor: finish.hex }}
                    className="w-9 h-9 rounded-xl border-2 border-slate-700 shadow-md flex items-center justify-center flex-shrink-0"
                  >
                    {isSelected && (
                      <Check
                        className={`w-5 h-5 ${
                          finish.id === 'white' ? 'text-slate-900' : 'text-blue-400'
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{finish.label}</span>
                      {isSelected && (
                        <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-400 rounded text-[9px] font-bold">
                          SELECTED
                        </span>
                      )}
                    </div>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      40mm Commercial Hexagonal Aluminum Legs
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-black text-blue-400">
                    {finish.surcharge === 0 ? 'INCLUDED' : `+$${finish.surcharge}`}
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    {finish.surcharge === 0 ? 'Standard' : 'Premium Finish'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frame Engineering Specs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          Hex-Truss Engineering Highlights
        </span>
        <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
          <li>40mm hexagonal aluminum legs for maximum wind resistance.</li>
          <li>Reinforced extruded aluminum cross-truss bars with nylon glide fittings.</li>
          <li>Push-button pinch-free thumb latches with 5 height settings.</li>
          <li>Heavy-duty welded steel footplates with oversized stake holes.</li>
        </ul>
      </div>

      {/* Step Navigation Buttons */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={prevStep}
          className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back: Size</span>
        </button>

        <button
          onClick={nextStep}
          className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-900/40 transition-all hover:scale-[1.01]"
        >
          <span>Next: Branding</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
