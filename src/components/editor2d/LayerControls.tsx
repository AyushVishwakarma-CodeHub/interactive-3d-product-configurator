import React, { useRef } from 'react';
import { useConfiguratorStore } from '../../store/useConfiguratorStore';
import { useUIStore } from '../../store/useUIStore';
import { TextLayer, ImageLayer, CANOPY_COLOR_PRESETS } from '../../types/config';
import { Type, Image as ImageIcon, Trash2, RotateCw, ZoomIn, Palette, Check, AlignLeft, AlignCenter, AlignRight, Bold, Move } from 'lucide-react';

export const LayerControls: React.FC = () => {
  const activeSection = useUIStore((s) => s.activeSection);
  const selectedLayerId = useUIStore((s) => s.selectedLayerId);
  const setSelectedLayerId = useUIStore((s) => s.setSelectedLayerId);
  const showToast = useUIStore((s) => s.showToast);

  const config = useConfiguratorStore((s) => s.config);
  const addLayer = useConfiguratorStore((s) => s.addLayer);
  const updateLayer = useConfiguratorStore((s) => s.updateLayer);
  const removeLayer = useConfiguratorStore((s) => s.removeLayer);
  const setSectionBackgroundColor = useConfiguratorStore((s) => s.setSectionBackgroundColor);
  const setGlobalColor = useConfiguratorStore((s) => s.setGlobalColor);
  const setUseGlobalColor = useConfiguratorStore((s) => s.setUseGlobalColor);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const section = config.sections[activeSection];
  const activeLayer = section?.layers.find((l) => l.id === selectedLayerId);

  // Add new Text layer
  const handleAddText = () => {
    const newText: TextLayer = {
      id: `text_${Date.now()}`,
      type: 'text',
      text: 'CANOPY BRAND',
      fontSize: 44,
      fontFamily: 'Montserrat',
      color: '#FFFFFF',
      fontWeight: 'bold',
      x: 0.5,
      y: 0.5,
      scale: 1.0,
      rotation: 0,
    };
    addLayer(activeSection, newText);
    setSelectedLayerId(newText.id);
    showToast('Added new text layer');
  };

  // Upload Logo
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const newImg: ImageLayer = {
          id: `img_${Date.now()}`,
          type: 'image',
          name: file.name,
          src,
          aspectRatio,
          x: 0.5,
          y: 0.5,
          scale: 1.0,
          rotation: 0,
        };
        addLayer(activeSection, newImg);
        setSelectedLayerId(newImg.id);
        showToast(`Uploaded ${file.name}`);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Pre-loaded sample logos for instant testing!
  const handleAddSampleLogo = (type: 'tech' | 'sports') => {
    const sampleSvg =
      type === 'tech'
        ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80"><rect width="200" height="80" rx="12" fill="%231E3A8A"/><text x="100" y="48" font-family="Montserrat" font-weight="900" font-size="28" fill="%23FFFFFF" text-anchor="middle">VERTEX 3D</text></svg>'
        : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80"><polygon points="20,70 100,15 180,70" fill="%23DC2626"/><circle cx="100" cy="50" r="18" fill="%23FFFFFF"/><text x="100" y="55" font-family="Montserrat" font-weight="900" font-size="14" fill="%23DC2626" text-anchor="middle">MVP</text></svg>';

    const sampleLayer: ImageLayer = {
      id: `img_sample_${Date.now()}`,
      type: 'image',
      name: type === 'tech' ? 'Vertex Logo' : 'MVP Badge',
      src: sampleSvg,
      aspectRatio: 200 / 80,
      x: 0.5,
      y: 0.5,
      scale: 1.0,
      rotation: 0,
    };
    addLayer(activeSection, sampleLayer);
    setSelectedLayerId(sampleLayer.id);
    showToast(`Added sample ${type} logo`);
  };

  const currentColor = config.useGlobalColor ? config.globalColor : section?.backgroundColor || '#FFFFFF';

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-3 flex flex-col gap-3">
      {/* Quick Action Buttons: Add Text, Upload Logo, Sample Logos */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleAddText}
          className="flex-1 min-w-[120px] px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors"
        >
          <Type className="w-4 h-4" />
          <span>Add Text</span>
        </button>

        <button
          onClick={handleUploadClick}
          className="flex-1 min-w-[120px] px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
          <span>Upload Logo</span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleAddSampleLogo('tech')}
            className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-[11px] font-medium"
            title="Insert Sample Tech Brand"
          >
            + Tech Logo
          </button>
          <button
            onClick={() => handleAddSampleLogo('sports')}
            className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-[11px] font-medium"
            title="Insert Sample Badge"
          >
            + Sports Badge
          </button>
        </div>
      </div>

      {/* Selected Layer Properties Editor */}
      {activeLayer ? (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              {activeLayer.type === 'text' ? <Type className="w-3.5 h-3.5 text-blue-400" /> : <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />}
              {activeLayer.type === 'text' ? 'Text Layer Properties' : 'Logo / Image Properties'}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateLayer(activeSection, activeLayer.id, { x: 0.5, y: 0.5 })}
                className="px-2 py-0.5 text-[10px] text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 flex items-center gap-1"
                title="Center layer in printable area"
              >
                <Move className="w-2.5 h-2.5" /> Center
              </button>
              <button
                onClick={() => removeLayer(activeSection, activeLayer.id)}
                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                title="Delete Layer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Text specific controls */}
          {activeLayer.type === 'text' && (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={(activeLayer as TextLayer).text}
                onChange={(e) => updateLayer(activeSection, activeLayer.id, { text: e.target.value })}
                placeholder="Enter text..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Font Family</label>
                  <select
                    value={(activeLayer as TextLayer).fontFamily}
                    onChange={(e) => updateLayer(activeSection, activeLayer.id, { fontFamily: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="Montserrat">Montserrat (Modern Bold)</option>
                    <option value="Inter">Inter (Clean Sans)</option>
                    <option value="Roboto Condensed">Roboto Condensed (Impact)</option>
                    <option value="Georgia">Georgia (Serif)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Font Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={(activeLayer as TextLayer).color}
                      onChange={(e) => updateLayer(activeSection, activeLayer.id, { color: e.target.value })}
                      className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={(activeLayer as TextLayer).color}
                      onChange={(e) => updateLayer(activeSection, activeLayer.id, { color: e.target.value })}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[11px] text-white uppercase font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Font Size & Weight & Alignment */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Font Size</span>
                    <span>{(activeLayer as TextLayer).fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="96"
                    step="2"
                    value={(activeLayer as TextLayer).fontSize}
                    onChange={(e) => updateLayer(activeSection, activeLayer.id, { fontSize: parseInt(e.target.value) })}
                    className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex items-end justify-between gap-1">
                  {/* Font Weight */}
                  <div className="flex items-center gap-0.5 bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                    <button
                      onClick={() => updateLayer(activeSection, activeLayer.id, { fontWeight: 'normal' })}
                      className={`px-2 py-1 text-[10px] rounded ${
                        (activeLayer as TextLayer).fontWeight === 'normal' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400'
                      }`}
                      title="Regular"
                    >
                      Reg
                    </button>
                    <button
                      onClick={() => updateLayer(activeSection, activeLayer.id, { fontWeight: 'bold' })}
                      className={`px-2 py-1 text-[10px] rounded flex items-center gap-0.5 ${
                        (activeLayer as TextLayer).fontWeight === 'bold' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
                      }`}
                      title="Bold"
                    >
                      <Bold className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => updateLayer(activeSection, activeLayer.id, { fontWeight: '900' })}
                      className={`px-2 py-1 text-[10px] rounded font-black ${
                        (activeLayer as TextLayer).fontWeight === '900' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                      title="Ultra 900"
                    >
                      900
                    </button>
                  </div>

                  {/* Alignment */}
                  <div className="flex items-center gap-0.5 bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                    <button
                      onClick={() => updateLayer(activeSection, activeLayer.id, { textAlign: 'left' })}
                      className={`p-1 rounded ${
                        (activeLayer as TextLayer).textAlign === 'left' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                      title="Align Left"
                    >
                      <AlignLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateLayer(activeSection, activeLayer.id, { textAlign: 'center' })}
                      className={`p-1 rounded ${
                        !(activeLayer as TextLayer).textAlign || (activeLayer as TextLayer).textAlign === 'center'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400'
                      }`}
                      title="Align Center"
                    >
                      <AlignCenter className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateLayer(activeSection, activeLayer.id, { textAlign: 'right' })}
                      className={`p-1 rounded ${
                        (activeLayer as TextLayer).textAlign === 'right' ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                      title="Align Right"
                    >
                      <AlignRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transform Sliders: Scale & Rotation */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/60">
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3 h-3" /> Scale
                </span>
                <span>{(activeLayer.scale).toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.05"
                value={activeLayer.scale}
                onChange={(e) => updateLayer(activeSection, activeLayer.id, { scale: parseFloat(e.target.value) })}
                className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <RotateCw className="w-3 h-3" /> Rotate
                </span>
                <span>{activeLayer.rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={activeLayer.rotation}
                onChange={(e) => updateLayer(activeSection, activeLayer.id, { rotation: parseInt(e.target.value) })}
                className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Section Background Color Swatches */
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              Fabric Background Color
            </span>
            <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={config.useGlobalColor}
                onChange={(e) => setUseGlobalColor(e.target.checked)}
                className="rounded accent-blue-500"
              />
              <span>Apply to all zones</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {CANOPY_COLOR_PRESETS.map((color) => {
              const isSelected = currentColor.toLowerCase() === color.hex.toLowerCase();
              return (
                <button
                  key={color.hex}
                  onClick={() => {
                    if (config.useGlobalColor) {
                      setGlobalColor(color.hex);
                    } else {
                      setSectionBackgroundColor(activeSection, color.hex);
                    }
                  }}
                  title={color.label}
                  style={{ backgroundColor: color.hex }}
                  className={`w-6 h-6 rounded-md border flex items-center justify-center transition-transform hover:scale-110 ${
                    isSelected ? 'ring-2 ring-blue-400 border-white scale-105' : 'border-slate-700'
                  }`}
                >
                  {isSelected && (
                    <Check
                      className={`w-3.5 h-3.5 ${
                        color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#f59e0b'
                          ? 'text-slate-900'
                          : 'text-white'
                      }`}
                    />
                  )}
                </button>
              );
            })}

            {/* Custom Color Input */}
            <div className="flex items-center ml-auto gap-1">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => {
                  if (config.useGlobalColor) {
                    setGlobalColor(e.target.value);
                  } else {
                    setSectionBackgroundColor(activeSection, e.target.value);
                  }
                }}
                className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                title="Custom Hex Picker"
              />
              <span className="text-[10px] font-mono text-slate-400 uppercase">{currentColor}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

