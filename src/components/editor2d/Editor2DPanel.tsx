import React from 'react';
import { SectionSelector } from './SectionSelector';
import { CanvasInteractive } from './CanvasInteractive';
import { LayerControls } from './LayerControls';

export const Editor2DPanel: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border-l border-slate-800 overflow-hidden">
      {/* 1. Zone Switcher */}
      <SectionSelector />

      {/* 2. Interactive Canvas */}
      <CanvasInteractive />

      {/* 3. Layer and Styling Controls */}
      <LayerControls />
    </div>
  );
};

