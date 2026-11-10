import React from 'react';
import { useUIStore, SidebarTab } from '../../store/useUIStore';
import { SizeOptions } from './SizeOptions';
import { HardwareOptions } from './HardwareOptions';
import { BrandingTab } from './BrandingTab';
import { AccessoriesOptions } from './AccessoriesOptions';
import { PricingSummary } from './PricingSummary';
import { Ruler, ShieldCheck, Paintbrush, Package, DollarSign } from 'lucide-react';

interface SidebarDrawerProps {
  get3DSnapshot?: () => string | undefined;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ get3DSnapshot }) => {
  const sidebarTab = useUIStore((s) => s.sidebarTab);
  const setSidebarTab = useUIStore((s) => s.setSidebarTab);

  // Map any legacy or shorthand tab names to the active step
  const activeTab: SidebarTab =
    sidebarTab === 'options'
      ? 'hardware'
      : sidebarTab === 'design'
      ? 'branding'
      : sidebarTab === 'pricing'
      ? 'review'
      : sidebarTab;

  const steps: { id: SidebarTab; stepNum: number; label: string; icon: React.ElementType }[] = [
    { id: 'size', stepNum: 1, label: 'Size', icon: Ruler },
    { id: 'hardware', stepNum: 2, label: 'Frame', icon: ShieldCheck },
    { id: 'branding', stepNum: 3, label: 'Branding', icon: Paintbrush },
    { id: 'accessories', stepNum: 4, label: 'Accessories', icon: Package },
    { id: 'review', stepNum: 5, label: 'Review', icon: DollarSign },
  ];

  const currentStepObj = steps.find((s) => s.id === activeTab) || steps[0];

  return (
    <div className="w-80 md:w-96 flex flex-col bg-slate-950 border-l border-slate-800 h-full shadow-2xl z-20">
      {/* Step Header with Commercial Stepper Progress */}
      <div className="bg-slate-900 border-b border-slate-800 p-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Configure Your Custom Tent
          </span>
          <span className="text-[10px] font-black text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-800/80">
            Step {currentStepObj.stepNum} of 5
          </span>
        </div>

        {/* Stepper Tabs Bar */}
        <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCurrent = activeTab === step.id;
            const isCompleted = step.stepNum < currentStepObj.stepNum;

            return (
              <button
                key={step.id}
                onClick={() => setSidebarTab(step.id)}
                className={`py-1.5 px-0.5 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-400'
                    : isCompleted
                    ? 'text-emerald-400 hover:bg-slate-900 hover:text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title={`Step ${step.stepNum}: ${step.label}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate w-full text-center">{step.label}</span>
                {isCompleted && !isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Contents */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'size' && <SizeOptions />}
        {activeTab === 'hardware' && <HardwareOptions />}
        {activeTab === 'branding' && <BrandingTab />}
        {activeTab === 'accessories' && <AccessoriesOptions />}
        {activeTab === 'review' && <PricingSummary get3DSnapshot={get3DSnapshot} />}
      </div>
    </div>
  );
};
