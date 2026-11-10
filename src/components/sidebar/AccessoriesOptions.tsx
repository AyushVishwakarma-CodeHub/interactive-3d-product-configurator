import React from 'react';
import { useConfiguratorStore } from '../../store/useConfiguratorStore';
import { useUIStore } from '../../store/useUIStore';
import { Package, Luggage, Weight, Anchor, Flag, ArrowRight, ArrowLeft, Shield, PanelsTopLeft } from 'lucide-react';

export const AccessoriesOptions: React.FC = () => {
  const accessories = useConfiguratorStore((s) => s.config.accessories);
  const setAccessories = useConfiguratorStore((s) => s.setAccessories);
  const nextStep = useUIStore((s) => s.nextStep);
  const prevStep = useUIStore((s) => s.prevStep);

  const accessoryList = [
    {
      key: 'rollerBag' as const,
      label: 'Deluxe Heavy-Duty Roller Transport Bag',
      price: 65,
      icon: Luggage,
      tag: 'RECOMMENDED',
      desc: 'All-terrain rubber wheels, dual reinforced handles, and internal accessory pockets.',
    },
    {
      key: 'sandbags' as const,
      label: 'Commercial Sandbag Weights (4-Pack)',
      price: 40,
      icon: Weight,
      tag: 'SAFETY BALLAST',
      desc: 'Up to 120 lbs total ballast. High-denier waterproof fabric with heavy-duty quick-release buckle straps.',
    },
    {
      key: 'heavyDutyStakes' as const,
      label: 'Steel Ground Stakes & Tie-Down Straps',
      price: 25,
      icon: Anchor,
      tag: 'WIND ANCHOR',
      desc: 'Reinforced 10-inch forged steel stakes with quick-tension cam buckles for grass and dirt surfaces.',
    },
    {
      key: 'flagMounts' as const,
      label: 'Leg-Mounted Feather Flag Brackets (Pair)',
      price: 35,
      icon: Flag,
      tag: 'MARKETING',
      desc: 'Quick-clamp universal brackets to mount marketing flags directly to the hexagonal tent legs.',
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/40 border border-blue-500/30 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-blue-400" />
            Step 4: Walls, Ballast & Accessories
          </span>
          <span className="text-[10px] font-extrabold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
            Event Package
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1 font-medium">
          Equip your tent setup for all-weather outdoor activations, trade show regulations, and secure transport.
        </p>
      </div>

      {/* Sidewall Options (MVP Visuals Highlight) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <PanelsTopLeft className="w-3.5 h-3.5 text-blue-400" />
            Custom Sidewalls & Enclosures
          </span>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            Optional Add-ons
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Standard configurations support modular velcro-attach full back walls and half-height side rail skirts. Full walls can be printed single- or double-sided.
        </p>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-lg flex flex-col justify-between">
            <div>
              <span className="font-bold text-white block">Full Back Wall</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Heavy 600D with velcro loops</span>
            </div>
            <span className="text-blue-400 font-bold mt-2">Available upon request</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-lg flex flex-col justify-between">
            <div>
              <span className="font-bold text-white block">Half Sidewalls</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Includes aluminum stabilizer bar</span>
            </div>
            <span className="text-blue-400 font-bold mt-2">Available upon request</span>
          </div>
        </div>
      </div>

      {/* Commercial Ballast & Hardware List */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          Ballast & Transport Hardware
        </label>

        <div className="flex flex-col gap-2.5">
          {accessoryList.map((item) => {
            const isSelected = accessories[item.key];
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                onClick={() => setAccessories({ [item.key]: !isSelected })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-blue-950/50 border-blue-500 shadow-md ring-1 ring-blue-500'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div
                  className={`p-2 rounded-lg mt-0.5 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{item.label}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-500/20 text-blue-400 rounded">
                        {item.tag}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-blue-400">+${item.price}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="rounded accent-blue-500 w-4 h-4 pointer-events-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Navigation Buttons */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={prevStep}
          className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back: Branding</span>
        </button>

        <button
          onClick={nextStep}
          className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-900/40 transition-all hover:scale-[1.01]"
        >
          <span>Next: Review & Price</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
