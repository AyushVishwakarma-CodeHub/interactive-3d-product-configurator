import React, { useRef, useEffect, useCallback } from 'react';
import { Header } from './components/common/Header';
import { ThreeCanvas } from './components/viewport/ThreeCanvas';
import { Editor2DPanel } from './components/editor2d/Editor2DPanel';
import { SidebarDrawer } from './components/sidebar/SidebarDrawer';
import { ShopifyCartDrawer } from './components/shopify/ShopifyCartDrawer';
import { CheckoutSuccessModal } from './components/shopify/CheckoutSuccessModal';
import { Toast } from './components/common/Toast';
import { useConfiguratorStore } from './store/useConfiguratorStore';
import { usePricingStore } from './store/usePricingStore';
import { useUIStore } from './store/useUIStore';
import { postMessageBridge } from './services/postMessageBridge';

export const App: React.FC = () => {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);

  const config = useConfiguratorStore((s) => s.config);
  const viewMode = useUIStore((s) => s.viewMode);
  const activeSection = useUIStore((s) => s.activeSection);
  const selectedLayerId = useUIStore((s) => s.selectedLayerId);
  const removeLayer = useConfiguratorStore((s) => s.removeLayer);
  const updateLayer = useConfiguratorStore((s) => s.updateLayer);
  const undo = useConfiguratorStore((s) => s.undo);
  const redo = useConfiguratorStore((s) => s.redo);
  const fetchPricing = usePricingStore((s) => s.fetchPricing);
  const pricing = usePricingStore((s) => s.pricing);

  // Keyboard shortcuts (Delete, Arrow nudges, Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing inside an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // Delete active layer
      if (selectedLayerId && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        removeLayer(activeSection, selectedLayerId);
        return;
      }

      // Nudge active layer with arrow keys
      if (selectedLayerId) {
        const step = e.shiftKey ? 0.05 : 0.01;
        const currentLayer = config.sections[activeSection]?.layers.find((l) => l.id === selectedLayerId);
        if (!currentLayer) return;

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          updateLayer(activeSection, selectedLayerId, { y: Math.max(0.05, currentLayer.y - step) });
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          updateLayer(activeSection, selectedLayerId, { y: Math.min(0.95, currentLayer.y + step) });
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          updateLayer(activeSection, selectedLayerId, { x: Math.max(0.05, currentLayer.x - step) });
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          updateLayer(activeSection, selectedLayerId, { x: Math.min(0.95, currentLayer.x + step) });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, activeSection, config, removeLayer, updateLayer, undo, redo]);

  // Debounced dynamic pricing fetch whenever configuration changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPricing(config);
    }, 120);

    return () => clearTimeout(timer);
  }, [config, fetchPricing]);

  // Notify parent host via postMessage (for iframe embedding)
  useEffect(() => {
    postMessageBridge.emit('CONFIGURATOR_READY', { status: 'ready', configId: config.id });
  }, []);

  // Listen for host commands when embedded in an iframe
  useEffect(() => {
    const unsubs = [
      postMessageBridge.on('SET_SIZE', (size) => {
        useConfiguratorStore.getState().setSize(size as any);
      }),
      postMessageBridge.on('SET_FRAME_FINISH', (finish) => {
        useConfiguratorStore.getState().setFrameFinish(finish as any);
      }),
      postMessageBridge.on('SET_GLOBAL_COLOR', (color) => {
        useConfiguratorStore.getState().setGlobalColor(color as string);
      }),
      postMessageBridge.on('SET_CONFIG', (newConfig) => {
        useConfiguratorStore.getState().loadConfiguration(newConfig as any);
      }),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  useEffect(() => {
    if (pricing) {
      postMessageBridge.emit('CONFIGURATOR_UPDATED', {
        config,
        pricing,
      });
    }
  }, [config, pricing]);

  // Capture clean 3D viewport snapshot for PDF and Shopify line-item thumbnail
  const get3DSnapshot = useCallback((): string | undefined => {
    if (!canvasElementRef.current) return undefined;
    try {
      return canvasElementRef.current.toDataURL('image/png');
    } catch (err) {
      console.warn('Could not capture 3D canvas snapshot:', err);
      return undefined;
    }
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 1. Global Navigation Header */}
      <Header get3DSnapshot={get3DSnapshot} />

      {/* 2. Main Configurator Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: 2D Design Editor (visible in 'split' and '2d' modes) */}
        {(viewMode === 'split' || viewMode === '2d') && (
          <div
            className={`h-full flex flex-col transition-all duration-300 ${
              viewMode === '2d' ? 'flex-1' : 'w-full md:w-[480px] lg:w-[540px] xl:w-[580px]'
            }`}
          >
            <Editor2DPanel />
          </div>
        )}

        {/* Center: 3D Viewport (visible in 'split' and '3d' modes) */}
        {(viewMode === 'split' || viewMode === '3d') && (
          <div className="flex-1 h-full relative overflow-hidden">
            <ThreeCanvas onCanvasReady={(el) => (canvasElementRef.current = el)} />
          </div>
        )}

        {/* Right: Options, Hardware, Accessories & Pricing Sidebar */}
        <SidebarDrawer get3DSnapshot={get3DSnapshot} />
      </div>

      {/* 3. Shopify Slide-Over Cart Drawer */}
      <ShopifyCartDrawer />

      {/* 4. Checkout Order Confirmed Modal */}
      <CheckoutSuccessModal get3DSnapshot={get3DSnapshot} />

      {/* 5. Feedback Toasts */}
      <Toast />
    </div>
  );
};

export default App;

