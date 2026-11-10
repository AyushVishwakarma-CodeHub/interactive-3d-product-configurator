import { create } from 'zustand';
import { TentSectionId } from '../types/config';

export type ViewMode = 'split' | '3d' | '2d';
export type CameraPreset = 'front' | 'back' | 'left' | 'right' | 'isometric' | 'top';
export type SidebarTab =
  | 'size'
  | 'hardware'
  | 'branding'
  | 'accessories'
  | 'review'
  | 'design'
  | 'options'
  | 'pricing';

export const ORDERED_STEPS: SidebarTab[] = ['size', 'hardware', 'branding', 'accessories', 'review'];

interface UIStore {
  activeSection: TentSectionId;
  viewMode: ViewMode;
  sidebarTab: SidebarTab;
  cameraPreset: CameraPreset;
  selectedLayerId: string | null;
  wireframeMode: boolean;
  autoRotate: boolean;
  shopifyCartOpen: boolean;
  checkoutModalOpen: boolean;
  pdfModalOpen: boolean;
  toastMessage: string | null;

  // Actions
  setActiveSection: (section: TentSectionId) => void;
  setViewMode: (mode: ViewMode) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  nextStep: () => void;
  prevStep: () => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setSelectedLayerId: (layerId: string | null) => void;
  toggleWireframe: () => void;
  toggleAutoRotate: () => void;
  setShopifyCartOpen: (open: boolean) => void;
  setCheckoutModalOpen: (open: boolean) => void;
  setPdfModalOpen: (open: boolean) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  activeSection: 'front_peak',
  viewMode: 'split',
  sidebarTab: 'size',
  cameraPreset: 'front',
  selectedLayerId: null,
  wireframeMode: false,
  autoRotate: false,
  shopifyCartOpen: false,
  checkoutModalOpen: false,
  pdfModalOpen: false,
  toastMessage: null,

  setActiveSection: (activeSection: TentSectionId) => {
    // Automatically match camera angle to the side of the section being edited!
    let targetCamera: CameraPreset | null = null;
    if (activeSection.startsWith('front')) targetCamera = 'front';
    else if (activeSection.startsWith('back')) targetCamera = 'back';
    else if (activeSection.startsWith('left')) targetCamera = 'left';
    else if (activeSection.startsWith('right')) targetCamera = 'right';

    set((state) => ({
      activeSection,
      selectedLayerId: null,
      cameraPreset: targetCamera ? targetCamera : state.cameraPreset,
    }));
  },

  setViewMode: (viewMode: ViewMode) => set({ viewMode }),
  setSidebarTab: (sidebarTab: SidebarTab) => set({ sidebarTab }),
  nextStep: () => {
    const current = get().sidebarTab;
    const normalized =
      current === 'options' ? 'hardware' : current === 'design' ? 'branding' : current === 'pricing' ? 'review' : current;
    const idx = ORDERED_STEPS.indexOf(normalized);
    if (idx >= 0 && idx < ORDERED_STEPS.length - 1) {
      set({ sidebarTab: ORDERED_STEPS[idx + 1] });
    }
  },
  prevStep: () => {
    const current = get().sidebarTab;
    const normalized =
      current === 'options' ? 'hardware' : current === 'design' ? 'branding' : current === 'pricing' ? 'review' : current;
    const idx = ORDERED_STEPS.indexOf(normalized);
    if (idx > 0) {
      set({ sidebarTab: ORDERED_STEPS[idx - 1] });
    }
  },
  setCameraPreset: (cameraPreset: CameraPreset) => set({ cameraPreset, autoRotate: false }),
  setSelectedLayerId: (selectedLayerId: string | null) => set({ selectedLayerId }),
  toggleWireframe: () => set((state) => ({ wireframeMode: !state.wireframeMode })),
  toggleAutoRotate: () => set((state) => ({ autoRotate: !state.autoRotate })),
  setShopifyCartOpen: (shopifyCartOpen: boolean) => set({ shopifyCartOpen }),
  setCheckoutModalOpen: (checkoutModalOpen: boolean) => set({ checkoutModalOpen }),
  setPdfModalOpen: (pdfModalOpen: boolean) => set({ pdfModalOpen }),
  showToast: (msg: string) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      set((state) => (state.toastMessage === msg ? { toastMessage: null } : {}));
    }, 3500);
  },
  clearToast: () => set({ toastMessage: null }),
}));

