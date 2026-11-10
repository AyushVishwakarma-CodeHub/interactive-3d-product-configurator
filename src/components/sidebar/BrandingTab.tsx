import React from 'react';
import { useConfiguratorStore } from '../../store/useConfiguratorStore';
import { useUIStore } from '../../store/useUIStore';
import { TentSectionId, CANOPY_COLOR_PRESETS } from '../../types/config';
import { BRAND_TEMPLATES, applyTemplateToConfig } from '../../utils/brandTemplates';
import { Paintbrush, Palette, Sparkles, Layers, ArrowRight, ArrowLeft, MousePointerClick, Check } from 'lucide-react';

export const BrandingTab: React.FC = () => {
  const config = useConfiguratorStore((s) => s.config);
  const setGlobalColor = useConfiguratorStore((s) => s.setGlobalColor);
  const setUseGlobalColor = useConfiguratorStore((s) => s.setUseGlobalColor);
  const loadConfiguration = useConfiguratorStore((s) => s.loadConfiguration);
  const activeSection = useUIStore((s) => s.activeSection);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const nextStep = useUIStore((s) => s.nextStep);
  const prevStep = useUIStore((s) => s.prevStep);
  const showToast = useUIStore((s) => s.showToast);

  const sides: { id: 'front' | 'right' | 'back' | 'left'; label: string }[] = [
    { id: 'front', label: 'Front' },
    { id: 'right', label: 'Right' },
    { id: 'back', label: 'Back' },
    { id: 'left', label: 'Left' },
  ];

  const handleApplyTemplate = (tmplId: string) => {
    const tmpl = BRAND_TEMPLATES.find((t) => t.id === tmplId);
    if (!tmpl) return;
    const updated = applyTemplateToConfig(config, tmpl);
    loadConfiguration(updated);
    showToast(`Loaded preset theme: ${tmpl.name}`);
  };

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/40 border border-blue-500/30 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
            <Paintbrush className="w-3.5 h-3.5 text-blue-400" />
            Step 3: Canopy Branding & Graphics
          </span>
          <span className="text-[10px] font-extrabold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
            Full-Color Dye-Sub
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1 font-medium">
          Customize all 8 printable locations (4 peaks & 4 valances) with unlimited colors, text, and vector logos.
        </p>
      </div>

      {/* 1. Master Fabric Color Palette */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            Canopy Fabric Color
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={config.useGlobalColor}
              onChange={(e) => setUseGlobalColor(e.target.checked)}
              className="rounded accent-blue-500"
            />
            <span>All Sections</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {CANOPY_COLOR_PRESETS.map((color) => {
            const isSelected = config.globalColor.toUpperCase() === color.hex.toUpperCase();
            return (
              <button
                key={color.hex}
                onClick={() => setGlobalColor(color.hex)}
                title={`${color.label} (${color.hex})`}
                style={{ backgroundColor: color.hex }}
                className={`w-7 h-7 rounded-lg border-2 transition-all relative flex items-center justify-center ${
                  isSelected
                    ? 'border-blue-500 scale-110 shadow-lg ring-2 ring-blue-500/40'
                    : 'border-slate-700 hover:scale-105'
                }`}
              >
                {isSelected && (
                  <Check
                    className={`w-4 h-4 ${
                      ['#FFFFFF', '#F59E0B'].includes(color.hex.toUpperCase())
                        ? 'text-slate-900'
                        : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Zone Selection Navigator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            Printable Zones (8 Locations)
          </span>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
            1st Location Included
          </span>
        </div>

        <p className="text-[11px] text-slate-400">
          Select a face below or click any face directly on the 3D model to design that area:
        </p>

        <div className="grid grid-cols-4 gap-1.5">
          {sides.map((side) => {
            const peakId: TentSectionId = `${side.id}_peak` as TentSectionId;
            const valanceId: TentSectionId = `${side.id}_valance` as TentSectionId;
            const isPeakActive = activeSection === peakId;
            const isValanceActive = activeSection === valanceId;
            const peakLayers = config.sections[peakId]?.layers.length || 0;
            const valanceLayers = config.sections[valanceId]?.layers.length || 0;

            return (
              <div key={side.id} className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-center text-slate-400 uppercase">
                  {side.label}
                </span>
                <button
                  onClick={() => setActiveSection(peakId)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-semibold border text-center transition-all relative ${
                    isPeakActive
                      ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                      : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>Peak</span>
                  {peakLayers > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center justify-center">
                      {peakLayers}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveSection(valanceId)}
                  className={`py-1 px-1 rounded-md text-[11px] font-semibold border text-center transition-all relative ${
                    isValanceActive
                      ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                      : 'bg-slate-800/90 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <span>Valance</span>
                  {valanceLayers > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black flex items-center justify-center">
                      {valanceLayers}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 2D Editor & 3D Picking Callout */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-slate-200">
          <MousePointerClick className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Live Synchronized Design</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          The 2D Design Editor on the left lets you upload logos (PNG, JPG, SVG), edit typography with custom fonts, and drag/scale elements freely. All changes update instantaneously on the 3D tent model.
        </p>
        <button
          onClick={() => setViewMode('split')}
          className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Open Split 2D/3D Studio</span>
        </button>
      </div>

      {/* 4. One-Click Sample Brand Themes */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          1-Click Sample Themes
        </span>
        <div className="flex flex-col gap-1.5">
          {BRAND_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleApplyTemplate(tmpl.id)}
              className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: tmpl.accentColor }}
                  className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                />
                <span className="text-xs font-bold text-white">{tmpl.name}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{tmpl.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step Navigation Buttons */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={prevStep}
          className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back: Frame</span>
        </button>

        <button
          onClick={nextStep}
          className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-900/40 transition-all hover:scale-[1.01]"
        >
          <span>Next: Walls & Add-ons</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

