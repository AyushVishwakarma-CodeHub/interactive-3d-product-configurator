import React, { useRef, useState } from 'react';
import { useConfiguratorStore } from '../../store/useConfiguratorStore';
import { useUIStore } from '../../store/useUIStore';
import { UV_ZONES } from '../../engine/uvZones';
import { Layer, TextLayer, ImageLayer } from '../../types/config';

export const CanvasInteractive: React.FC = () => {
  const activeSection = useUIStore((s) => s.activeSection);
  const selectedLayerId = useUIStore((s) => s.selectedLayerId);
  const setSelectedLayerId = useUIStore((s) => s.setSelectedLayerId);

  const config = useConfiguratorStore((s) => s.config);
  const updateLayer = useConfiguratorStore((s) => s.updateLayer);

  const containerRef = useRef<HTMLDivElement>(null);
  const zoneDef = UV_ZONES[activeSection];
  const section = config.sections[activeSection];

  // Dragging / Transform State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialLayerPos, setInitialLayerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Interactive Corner Resize State
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialScale, setInitialScale] = useState(1);

  const activeLayer = section?.layers.find((l) => l.id === selectedLayerId);
  const bgColor = config.useGlobalColor ? config.globalColor : section?.backgroundColor || '#FFFFFF';

  const isTriangle = zoneDef.isTriangle;
  const aspectRatio = zoneDef.editorWidth / zoneDef.editorHeight;

  // Pointer interaction on layer
  const handlePointerDownLayer = (e: React.PointerEvent, layer: Layer) => {
    if (isResizing) return;
    e.stopPropagation();
    setSelectedLayerId(layer.id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialLayerPos({ x: layer.x, y: layer.y });
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerDownResize = (e: React.PointerEvent, layer: Layer) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
    setInitialScale(layer.scale);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isResizing && activeLayer) {
      const delta = (e.clientX - resizeStart.x + (e.clientY - resizeStart.y)) / 120;
      const newScale = Math.max(0.3, Math.min(2.5, initialScale + delta));
      updateLayer(activeSection, activeLayer.id, { scale: parseFloat(newScale.toFixed(2)) });
      return;
    }

    if (!isDragging || !activeLayer || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = (e.clientX - dragStart.x) / rect.width;
    const deltaY = (e.clientY - dragStart.y) / rect.height;

    const newX = Math.max(0.05, Math.min(0.95, initialLayerPos.x + deltaX));
    const newY = Math.max(0.05, Math.min(0.95, initialLayerPos.y + deltaY));

    updateLayer(activeSection, activeLayer.id, {
      x: parseFloat(newX.toFixed(3)),
      y: parseFloat(newY.toFixed(3)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isResizing) {
      setIsResizing(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setSelectedLayerId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-950/60 overflow-hidden select-none">
      {/* Active Section Label & Dimensions */}
      <div className="w-full max-w-lg flex items-center justify-between mb-1 px-1 text-xs text-slate-400">
        <span className="font-semibold text-slate-200">{zoneDef.label} Proof Area</span>
        <span className="text-[11px] font-mono">
          {zoneDef.isTriangle ? 'Triangular Peak Face' : 'Rectangular Valance Strip'}
        </span>
      </div>

      {/* Layer Position / Transform Telemetry */}
      {activeLayer && (
        <div className="w-full max-w-lg flex items-center justify-between px-2 py-0.5 mb-1.5 rounded bg-blue-950/50 border border-blue-900/40 text-[10px] font-mono text-blue-300">
          <span>Selected: {activeLayer.type === 'text' ? `Text ("${(activeLayer as TextLayer).text.slice(0, 15)}")` : 'Logo'}</span>
          <div className="flex items-center gap-2">
            <span>X: {(activeLayer.x * 100).toFixed(0)}%</span>
            <span>Y: {(activeLayer.y * 100).toFixed(0)}%</span>
            <span>Scale: {activeLayer.scale.toFixed(2)}x</span>
            <span>Rot: {activeLayer.rotation}°</span>
          </div>
        </div>
      )}

      {/* 2D Interactive Canvas Box */}
      <div
        ref={containerRef}
        onClick={handleBackgroundClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          aspectRatio: `${aspectRatio}`,
          backgroundColor: bgColor,
        }}
        className={`relative w-full max-w-lg shadow-2xl transition-colors duration-200 border-2 overflow-hidden flex items-center justify-center ${
          isTriangle ? 'border-dashed border-slate-600/70' : 'border-slate-700 rounded-md'
        }`}
      >
        {/* Peak Triangle SVG Safe Mask & Guide */}
        {isTriangle && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Dark outside mask */}
            <polygon points="0,0 100,0 50,0" fill="transparent" />
            <path
              d="M 0,0 L 50,0 L 0,100 Z M 100,0 L 50,0 L 100,100 Z"
              fill="rgba(15, 23, 42, 0.65)"
            />
            {/* Golden dashed safe print boundary */}
            <polygon
              points="50,6 94,94 6,94"
              fill="none"
              stroke="rgba(245, 158, 11, 0.45)"
              strokeWidth="0.75"
              strokeDasharray="2,2"
            />
          </svg>
        )}

        {/* Valance Safe Print Guide */}
        {!isTriangle && (
          <div className="absolute inset-2 border border-dashed border-amber-500/35 pointer-events-none rounded" />
        )}

        {/* Layers Rendering */}
        {section?.layers.map((layer) => {
          const isSelected = selectedLayerId === layer.id;

          return (
            <div
              key={layer.id}
              onPointerDown={(e) => handlePointerDownLayer(e, layer)}
              style={{
                position: 'absolute',
                left: `${layer.x * 100}%`,
                top: `${layer.y * 100}%`,
                transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
              className={`group transition-shadow p-1.5 rounded ${
                isSelected
                  ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 shadow-xl z-20'
                  : 'hover:ring-1 hover:ring-blue-400/70 z-10'
              }`}
            >
              {layer.type === 'text' ? (
                <div
                  style={{
                    color: (layer as TextLayer).color,
                    fontFamily: (layer as TextLayer).fontFamily || 'Inter',
                    fontSize: `${(layer as TextLayer).fontSize * 0.45}px`,
                    fontWeight: (layer as TextLayer).fontWeight,
                    textAlign: (layer as TextLayer).textAlign || 'center',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    whiteSpace: 'pre-wrap',
                  }}
                  className="leading-tight select-none"
                >
                  {(layer as TextLayer).text || 'Double click to edit'}
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={(layer as ImageLayer).src}
                    alt={layer.name}
                    className="max-h-24 max-w-44 object-contain pointer-events-none drop-shadow-md"
                  />
                </div>
              )}

              {/* Selection Transform Handles indicator */}
              {isSelected && (
                <>
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow pointer-events-none" />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow pointer-events-none" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow pointer-events-none" />
                  <div
                    onPointerDown={(e) => handlePointerDownResize(e, layer)}
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-400 border-2 border-white rounded-full shadow-lg cursor-nwse-resize hover:scale-125 transition-transform z-30"
                    title="Drag corner to scale layer"
                  />
                </>
              )}
            </div>
          );
        })}

        {/* Empty state hint */}
        {(!section || section.layers.length === 0) && (
          <div className="text-center p-4 pointer-events-none">
            <p className="text-xs font-medium text-slate-400 bg-slate-900/75 px-3 py-1.5 rounded-full border border-slate-700/60 shadow">
              Click &quot;Add Text&quot; or &quot;Upload Logo&quot; below to customize this zone
            </p>
          </div>
        )}
      </div>

      <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <span>Dashed line indicates safe dye-sublimation print margin</span>
      </div>
    </div>
  );
};
