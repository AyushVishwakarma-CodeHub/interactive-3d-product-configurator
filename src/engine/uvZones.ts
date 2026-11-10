import { TentSectionId } from '../types/config';

export interface UVZoneDefinition {
  id: TentSectionId;
  label: string;
  category: 'peak' | 'valance';
  side: 'front' | 'back' | 'left' | 'right';
  // Normalized UV bounding box [0, 1] for 3D raycast picking
  uMin: number;
  vMin: number;
  uMax: number;
  vMax: number;
  // Center of zone in pixels on master 2048x2048 canvas
  centerX: number;
  centerY: number;
  // Dimensions of zone in upright canvas space
  zoneWidth: number;
  zoneHeight: number;
  // Rotation applied when projecting upright design onto master UV canvas (degrees)
  rotationDeg: number;
  // Shape type
  isTriangle: boolean;
  // 2D Editor canvas dimensions
  editorWidth: number;
  editorHeight: number;
}

export const MASTER_TEXTURE_SIZE = 2048;

/**
 * Mathematically verified UV mapping definitions for all 8 canopy sections.
 * The canopy is unrolled into a symmetric 4-way cross on the 2048x2048 canvas:
 * - Each peak has base = 1000px, height = 676px.
 * - Each valance has width = 1000px, height = 126px.
 */
export const UV_ZONES: Record<TentSectionId, UVZoneDefinition> = {
  // --- FRONT (Facing +Z) ---
  front_peak: {
    id: 'front_peak',
    label: 'Front Peak',
    category: 'peak',
    side: 'front',
    uMin: 0.25,
    vMin: 0.57,
    uMax: 0.75,
    vMax: 0.91,
    centerX: 1024,
    centerY: 1522,
    zoneWidth: 1000,
    zoneHeight: 676,
    rotationDeg: 0,
    isTriangle: true,
    editorWidth: 1000,
    editorHeight: 676,
  },
  front_valance: {
    id: 'front_valance',
    label: 'Front Valance',
    category: 'valance',
    side: 'front',
    uMin: 0.25,
    vMin: 0.91,
    uMax: 0.75,
    vMax: 0.98,
    centerX: 1024,
    centerY: 1923,
    zoneWidth: 1000,
    zoneHeight: 126,
    rotationDeg: 0,
    isTriangle: false,
    editorWidth: 1000,
    editorHeight: 126,
  },

  // --- BACK (Facing -Z) ---
  back_peak: {
    id: 'back_peak',
    label: 'Back Peak',
    category: 'peak',
    side: 'back',
    uMin: 0.25,
    vMin: 0.09,
    uMax: 0.75,
    vMax: 0.43,
    centerX: 1024,
    centerY: 526,
    zoneWidth: 1000,
    zoneHeight: 676,
    rotationDeg: 180,
    isTriangle: true,
    editorWidth: 1000,
    editorHeight: 676,
  },
  back_valance: {
    id: 'back_valance',
    label: 'Back Valance',
    category: 'valance',
    side: 'back',
    uMin: 0.25,
    vMin: 0.02,
    uMax: 0.75,
    vMax: 0.09,
    centerX: 1024,
    centerY: 125,
    zoneWidth: 1000,
    zoneHeight: 126,
    rotationDeg: 180,
    isTriangle: false,
    editorWidth: 1000,
    editorHeight: 126,
  },

  // --- LEFT (Facing -X) ---
  left_peak: {
    id: 'left_peak',
    label: 'Left Peak',
    category: 'peak',
    side: 'left',
    uMin: 0.09,
    vMin: 0.25,
    uMax: 0.43,
    vMax: 0.75,
    centerX: 526,
    centerY: 1024,
    zoneWidth: 1000,
    zoneHeight: 676,
    rotationDeg: 90,
    isTriangle: true,
    editorWidth: 1000,
    editorHeight: 676,
  },
  left_valance: {
    id: 'left_valance',
    label: 'Left Valance',
    category: 'valance',
    side: 'left',
    uMin: 0.02,
    vMin: 0.25,
    uMax: 0.09,
    vMax: 0.75,
    centerX: 125,
    centerY: 1024,
    zoneWidth: 1000,
    zoneHeight: 126,
    rotationDeg: 90,
    isTriangle: false,
    editorWidth: 1000,
    editorHeight: 126,
  },

  // --- RIGHT (Facing +X) ---
  right_peak: {
    id: 'right_peak',
    label: 'Right Peak',
    category: 'peak',
    side: 'right',
    uMin: 0.57,
    vMin: 0.25,
    uMax: 0.91,
    vMax: 0.75,
    centerX: 1522,
    centerY: 1024,
    zoneWidth: 1000,
    zoneHeight: 676,
    rotationDeg: -90,
    isTriangle: true,
    editorWidth: 1000,
    editorHeight: 676,
  },
  right_valance: {
    id: 'right_valance',
    label: 'Right Valance',
    category: 'valance',
    side: 'right',
    uMin: 0.91,
    vMin: 0.25,
    uMax: 0.98,
    vMax: 0.75,
    centerX: 1923,
    centerY: 1024,
    zoneWidth: 1000,
    zoneHeight: 126,
    rotationDeg: -90,
    isTriangle: false,
    editorWidth: 1000,
    editorHeight: 126,
  },
};

export const SECTION_LIST: TentSectionId[] = [
  'front_peak',
  'front_valance',
  'back_peak',
  'back_valance',
  'left_peak',
  'left_valance',
  'right_peak',
  'right_valance',
];

/**
 * Resolves an intersected UV coordinate (from 3D raycasting) into a specific canopy section.
 */
export function resolveUVToSection(u: number, v: number): TentSectionId | null {
  for (const [id, zone] of Object.entries(UV_ZONES)) {
    if (u >= zone.uMin && u <= zone.uMax && v >= zone.vMin && v <= zone.vMax) {
      return id as TentSectionId;
    }
  }
  return null;
}
