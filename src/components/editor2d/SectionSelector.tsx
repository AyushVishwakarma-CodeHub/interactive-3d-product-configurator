import React from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useConfiguratorStore } from '../../store/useConfiguratorStore';
import { TentSectionId } from '../../types/config';
import { Layers } from 'lucide-react';

export const SectionSelector: React.FC = () => {
  const activeSection = useUIStore((s) => s.activeSection);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const sections = useConfiguratorStore((s) => s.config.sections);

  const sides: { id: 'front' | 'back' | 'left' | 'right'; label: string }[] = [
    { id: 'front', label: 'Front' },
    { id: 'right', label: 'Right' },
    { id: 'back', label: 'Back' },
    { id: 'left', label: 'Left' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-2.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          Canopy Zones (8 Printable Areas)
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {sides.map((side) => {
          const peakId: TentSectionId = `${side.id}_peak` as TentSectionId;
          const valanceId: TentSectionId = `${side.id}_valance` as TentSectionId;

          const isPeakActive = activeSection === peakId;
          const isValanceActive = activeSection === valanceId;

          const peakLayerCount = sections[peakId]?.layers.length || 0;
          const valanceLayerCount = sections[valanceId]?.layers.length || 0;

          return (
            <div key={side.id} className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-center text-slate-400 uppercase">
                {side.label}
              </span>

              {/* Peak Button */}
              <button
                onClick={() => setActiveSection(peakId)}
                className={`relative px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                  isPeakActive
                    ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-900/40'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>Peak</span>
                {peakLayerCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                      isPeakActive ? 'bg-amber-400 text-slate-950' : 'bg-blue-500 text-white'
                    }`}
                  >
                    {peakLayerCount}
                  </span>
                )}
              </button>

              {/* Valance Button */}
              <button
                onClick={() => setActiveSection(valanceId)}
                className={`relative px-2 py-1 rounded-md text-[11px] font-medium border text-center transition-all ${
                  isValanceActive
                    ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-900/40'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>Valance</span>
                {valanceLayerCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center ${
                      isValanceActive ? 'bg-amber-400 text-slate-950' : 'bg-blue-500 text-white'
                    }`}
                  >
                    {valanceLayerCount}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
