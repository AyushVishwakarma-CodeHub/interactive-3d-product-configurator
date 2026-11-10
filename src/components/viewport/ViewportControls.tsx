import React from 'react';
import { useUIStore, CameraPreset } from '../../store/useUIStore';
import { RotateCw, Box, Compass, RefreshCw } from 'lucide-react';

export const ViewportControls: React.FC = () => {
  const cameraPreset = useUIStore((s) => s.cameraPreset);
  const setCameraPreset = useUIStore((s) => s.setCameraPreset);
  const autoRotate = useUIStore((s) => s.autoRotate);
  const toggleAutoRotate = useUIStore((s) => s.toggleAutoRotate);
  const wireframeMode = useUIStore((s) => s.wireframeMode);
  const toggleWireframe = useUIStore((s) => s.toggleWireframe);

  const presets: { id: CameraPreset; label: string }[] = [
    { id: 'front', label: 'Front' },
    { id: 'isometric', label: '3D Iso' },
    { id: 'right', label: 'Right' },
    { id: 'back', label: 'Back' },
    { id: 'left', label: 'Left' },
    { id: 'top', label: 'Top' },
  ];

  return (
    <div className="absolute bottom-4 left-4 right-4 md:right-auto flex flex-wrap items-center gap-2 z-10">
      {/* Camera angle pills */}
      <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/70 p-1 rounded-xl flex items-center gap-1 shadow-xl">
        <span className="px-2 text-xs font-semibold text-slate-400 flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Views:</span>
        </span>
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => setCameraPreset(p.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              cameraPreset === p.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Auxiliary toggles: Auto Rotate & Wireframe */}
      <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/70 p-1 rounded-xl flex items-center gap-1 shadow-xl">
        <button
          onClick={toggleAutoRotate}
          title="Toggle 360° Auto Rotation"
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${
            autoRotate
              ? 'bg-emerald-600 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Rotate</span>
        </button>

        <button
          onClick={toggleWireframe}
          title="Toggle 3D Wireframe Inspection"
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${
            wireframeMode
              ? 'bg-amber-600 text-white'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Wireframe</span>
        </button>

        <button
          onClick={() => setCameraPreset('isometric')}
          title="Reset Camera View"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

