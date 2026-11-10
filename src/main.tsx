import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { useConfiguratorStore } from './store/useConfiguratorStore';
import { useUIStore } from './store/useUIStore';
import { usePricingStore } from './store/usePricingStore';

import { shopifyService } from './services/shopifyService';
import { pdfService } from './services/pdfService';
import { globalTextureCompositor } from './engine/TextureCompositor';

// Expose stores & services on window for testing & integration debugging
if (typeof window !== 'undefined') {
  (window as any).configuratorStore = useConfiguratorStore;
  (window as any).uiStore = useUIStore;
  (window as any).pricingStore = usePricingStore;
  (window as any).shopifyService = shopifyService;
  (window as any).pdfService = pdfService;
  (window as any).textureCompositor = globalTextureCompositor;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

