import { create } from 'zustand';
import { ProductConfig, TentSize, FrameFinish, TentSectionId, Layer, AccessoryConfig } from '../types/config';
import { globalTextureCompositor } from '../engine/TextureCompositor';

const createInitialSection = (id: TentSectionId, label: string, category: 'peak' | 'valance', side: 'front' | 'back' | 'left' | 'right') => ({
  id,
  label,
  category,
  side,
  backgroundColor: '#FFFFFF',
  layers: [],
});

export const createDefaultConfig = (): ProductConfig => ({
  id: `tent_${Date.now()}`,
  name: 'Custom Heavy-Duty Canopy Tent',
  size: '5x5',
  frameFinish: 'silver',
  globalColor: '#FFFFFF',
  useGlobalColor: true,
  sections: {
    front_peak: {
      ...createInitialSection('front_peak', 'Front Peak', 'peak', 'front'),
      layers: [
        {
          id: 'demo_front_text',
          type: 'text',
          text: 'YOUR BRAND HERE',
          fontSize: 48,
          fontFamily: 'Montserrat',
          color: '#1E3A8A',
          fontWeight: '900',
          x: 0.5,
          y: 0.55,
          scale: 1.0,
          rotation: 0,
        },
      ],
    },
    front_valance: {
      ...createInitialSection('front_valance', 'Front Valance', 'valance', 'front'),
      layers: [
        {
          id: 'demo_valance_text',
          type: 'text',
          text: 'WWW.YOURCOMPANY.COM',
          fontSize: 28,
          fontFamily: 'Roboto Condensed',
          color: '#DC2626',
          fontWeight: 'bold',
          x: 0.5,
          y: 0.5,
          scale: 1.0,
          rotation: 0,
        },
      ],
    },
    back_peak: createInitialSection('back_peak', 'Back Peak', 'peak', 'back'),
    back_valance: createInitialSection('back_valance', 'Back Valance', 'valance', 'back'),
    left_peak: createInitialSection('left_peak', 'Left Peak', 'peak', 'left'),
    left_valance: createInitialSection('left_valance', 'Left Valance', 'valance', 'left'),
    right_peak: createInitialSection('right_peak', 'Right Peak', 'peak', 'right'),
    right_valance: createInitialSection('right_valance', 'Right Valance', 'valance', 'right'),
  },
  accessories: {
    rollerBag: true,
    sandbags: false,
    heavyDutyStakes: true,
    flagMounts: false,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

interface ConfiguratorStore {
  config: ProductConfig;
  past: ProductConfig[];
  future: ProductConfig[];

  // Actions
  setSize: (size: TentSize) => void;
  setFrameFinish: (finish: FrameFinish) => void;
  setGlobalColor: (hex: string) => void;
  setUseGlobalColor: (useGlobal: boolean) => void;
  setSectionBackgroundColor: (sectionId: TentSectionId, hex: string) => void;
  addLayer: (sectionId: TentSectionId, layer: Layer) => void;
  updateLayer: (sectionId: TentSectionId, layerId: string, partial: Partial<Layer>) => void;
  removeLayer: (sectionId: TentSectionId, layerId: string) => void;
  reorderLayers: (sectionId: TentSectionId, newLayers: Layer[]) => void;
  setAccessories: (partial: Partial<AccessoryConfig>) => void;
  resetConfiguration: () => void;
  loadConfiguration: (config: ProductConfig) => void;

  // History Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const pushHistory = (currentConfig: ProductConfig, past: ProductConfig[]): ProductConfig[] => {
  const maxHistory = 20;
  const newPast = [...past, JSON.parse(JSON.stringify(currentConfig))];
  if (newPast.length > maxHistory) {
    newPast.shift();
  }
  return newPast;
};

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => {
  const initialConfig = createDefaultConfig();
  // Trigger initial canvas render
  setTimeout(() => {
    globalTextureCompositor.scheduleRender(initialConfig);
  }, 50);

  return {
    config: initialConfig,
    past: [],
    future: [],

    setSize: (size: TentSize) => {
      set((state) => {
        const next = {
          ...state.config,
          size,
          updatedAt: new Date().toISOString(),
        };
        globalTextureCompositor.scheduleRender(next);
        return {
          past: pushHistory(state.config, state.past),
          future: [],
          config: next,
        };
      });
    },

    setFrameFinish: (frameFinish: FrameFinish) => {
      set((state) => {
        const next = {
          ...state.config,
          frameFinish,
          updatedAt: new Date().toISOString(),
        };
        return {
          past: pushHistory(state.config, state.past),
          future: [],
          config: next,
        };
      });
    },

    setGlobalColor: (globalColor: string) => {
      set((state) => {
        const next = {
          ...state.config,
          globalColor,
          updatedAt: new Date().toISOString(),
        };
        globalTextureCompositor.scheduleRender(next);
        return {
          past: pushHistory(state.config, state.past),
          future: [],
          config: next,
        };
      });
    },

    setUseGlobalColor: (useGlobalColor: boolean) => {
      set((state) => {
        const next = {
          ...state.config,
          useGlobalColor,
          updatedAt: new Date().toISOString(),
        };
        globalTextureCompositor.scheduleRender(next);
        return {
          past: pushHistory(state.config, state.past),
          future: [],
          config: next,
        };
      });
    },

    setSectionBackgroundColor: (sectionId: TentSectionId, backgroundColor: string) => {
      set((state) => {
        const section = state.config.sections[sectionId];
        if (!section) return state;

        const next = {
          ...state.config,
          useGlobalColor: false,
          sections: {
            ...state.config.sections,
            [sectionId]: {
              ...section,
              backgroundColor,
            },
          },
          updatedAt: new Date().toISOString(),
        };
        globalTextureCompositor.scheduleRender(next);
        return {
          past: pushHistory(state.config, state.past),
          future: [],
          config: next,
        };
      });
    },

    addLayer: (sectionId: TentSectionId, layer: Layer) => {
      set((state) => {
        const section = state.config.sections[sectionId];
        if (!section) return state;

        const next = {
          ...state.config,
          sections: {
            ...state.config.sections,
            [sectionId]: {
              ...section,
              layers: [...section.layers, layer],
            },
          },
          updatedAt: new Date().toISOString(),
        };
        globalTextureCompositor.scheduleRender(next);
        return {
          past: pushHistory(state.config, state.past),
          future: [],
          config: next,
        };
      });
    },

    updateLayer: (sectionId: TentSectionId, layerId: string, partial: Partial<Layer>) => {
      set((state) => {
        const section = state.config.sections[sectionId];
        if (!section) return state;

        const updatedLayers = section.layers.map((l) => {
          if (l.id === layerId) {
            return { ...l, ...partial } as Layer;
          }
          return l;
        });

        const next = {
          ...state.config,
          sections: {
            ...state.config.sections,
            [sectionId]: {
              ...section,
              layers: updatedLayers,
            },
          },
          updatedAt: new Date().toISOString(),
        };
        globalTextureCompositor.scheduleRender(next);
        return {
          config: next,
        };
      });
    },

    removeLayer: (sectionId: TentSectionId, layerId: string) => {
      set((state) => {
        const section = state.config.sections[sectionId];
        if (!section) return state;

        const next = {
          ...state.config,
          sections: {
            ...state.config.sections,
            [sectionId]: {
              ...section,
              layers: section.layers.filter((l) => l.id !== layerId),
            },
          },
          updatedAt: new Date().toISOString(),
        };
        globalTextureCompositor.scheduleRender(next);
        return {
          past: pushHistory(state.config, state.past),
          future: [],
          config: next,
        };
      });
    },

    reorderLayers: (sectionId: TentSectionId, newLayers: Layer[]) => {
      set((state) => {
        const section = state.config.sections[sectionId];
        if (!section) return state;

        const next = {
          ...state.config,
          sections: {
            ...state.config.sections,
            [sectionId]: {
              ...section,
              layers: newLayers,
            },
          },
          updatedAt: new Date().toISOString(),
        };
        globalTextureCompositor.scheduleRender(next);
        return {
          config: next,
        };
      });
    },

    setAccessories: (partial: Partial<AccessoryConfig>) => {
      set((state) => {
        const next = {
          ...state.config,
          accessories: {
            ...state.config.accessories,
            ...partial,
          },
          updatedAt: new Date().toISOString(),
        };
        return {
          past: pushHistory(state.config, state.past),
          future: [],
          config: next,
        };
      });
    },

    resetConfiguration: () => {
      const fresh = createDefaultConfig();
      globalTextureCompositor.scheduleRender(fresh);
      set((state) => ({
        past: pushHistory(state.config, state.past),
        future: [],
        config: fresh,
      }));
    },

    loadConfiguration: (config: ProductConfig) => {
      globalTextureCompositor.scheduleRender(config);
      set((state) => ({
        past: pushHistory(state.config, state.past),
        future: [],
        config,
      }));
    },

    undo: () => {
      const { past, config, future } = get();
      if (past.length === 0) return;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      const newFuture = [config, ...future];

      globalTextureCompositor.scheduleRender(previous);
      set({
        past: newPast,
        future: newFuture,
        config: previous,
      });
    },

    redo: () => {
      const { past, config, future } = get();
      if (future.length === 0) return;

      const next = future[0];
      const newFuture = future.slice(1);
      const newPast = [...past, config];

      globalTextureCompositor.scheduleRender(next);
      set({
        past: newPast,
        future: newFuture,
        config: next,
      });
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,
  };
});

