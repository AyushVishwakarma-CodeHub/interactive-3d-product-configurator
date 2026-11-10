export type TentSize = '5x5' | '6.5x6.5' | '8x8';

export type FrameFinish = 'silver' | 'black' | 'white';

export type TentSectionId =
  | 'front_peak'
  | 'front_valance'
  | 'back_peak'
  | 'back_valance'
  | 'left_peak'
  | 'left_valance'
  | 'right_peak'
  | 'right_valance';

export interface BaseLayer {
  id: string;
  x: number; // 0 to 1 relative to section canvas width
  y: number; // 0 to 1 relative to section canvas height
  scale: number; // multiplier, 1.0 = standard
  rotation: number; // degrees 0 - 360
  opacity?: number;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontSize: number; // in pixels relative to section resolution
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold' | '900';
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string; // data URL or public URL
  name: string;
  aspectRatio: number;
}

export type Layer = TextLayer | ImageLayer;

export interface SectionConfig {
  id: TentSectionId;
  label: string;
  category: 'peak' | 'valance';
  side: 'front' | 'back' | 'left' | 'right';
  backgroundColor: string; // Hex color
  layers: Layer[];
}

export interface AccessoryConfig {
  rollerBag: boolean;
  sandbags: boolean;
  heavyDutyStakes: boolean;
  flagMounts: boolean;
}

export interface ProductConfig {
  id: string;
  name: string;
  size: TentSize;
  frameFinish: FrameFinish;
  globalColor: string; // Master canopy color
  useGlobalColor: boolean; // If true, all sections inherit globalColor unless overridden
  sections: Record<TentSectionId, SectionConfig>;
  accessories: AccessoryConfig;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const TENT_SIZES: { id: TentSize; label: string; dimensions: string; modelPath: string; basePrice: number }[] = [
  {
    id: '5x5',
    label: '5 x 5 ft',
    dimensions: '1.5m x 1.5m footprint (Compact Booth)',
    modelPath: '/models/Tent_5_5.glb',
    basePrice: 499,
  },
  {
    id: '6.5x6.5',
    label: '6.5 x 6.5 ft',
    dimensions: '2.0m x 2.0m footprint (Mid-Size Commercial)',
    modelPath: '/models/Tent 6.5_6.5.glb',
    basePrice: 649,
  },
  {
    id: '8x8',
    label: '8 x 8 ft',
    dimensions: '2.4m x 2.4m footprint (Full Event Coverage)',
    modelPath: '/models/Tent_8_8.glb',
    basePrice: 849,
  },
];

export const FRAME_FINISHES: { id: FrameFinish; label: string; hex: string; roughness: number; metalness: number; surcharge: number }[] = [
  {
    id: 'silver',
    label: 'Anodized Silver Aluminum',
    hex: '#e2e8f0',
    roughness: 0.25,
    metalness: 0.9,
    surcharge: 0,
  },
  {
    id: 'black',
    label: 'Matte Stealth Black',
    hex: '#1e293b',
    roughness: 0.5,
    metalness: 0.4,
    surcharge: 45,
  },
  {
    id: 'white',
    label: 'Powder-Coated Gloss White',
    hex: '#f8fafc',
    roughness: 0.15,
    metalness: 0.2,
    surcharge: 35,
  },
];

export const CANOPY_COLOR_PRESETS: { label: string; hex: string }[] = [
  { label: 'Brilliant White', hex: '#FFFFFF' },
  { label: 'Onyx Black', hex: '#111827' },
  { label: 'Royal Blue', hex: '#1D4ED8' },
  { label: 'Navy Blue', hex: '#1E3A8A' },
  { label: 'Crimson Red', hex: '#DC2626' },
  { label: 'Sunburst Yellow', hex: '#F59E0B' },
  { label: 'Forest Green', hex: '#15803D' },
  { label: 'Vibrant Orange', hex: '#EA580C' },
  { label: 'Charcoal Grey', hex: '#4B5563' },
  { label: 'Imperial Purple', hex: '#7E22CE' },
];

