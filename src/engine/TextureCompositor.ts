import * as THREE from 'three';
import { ProductConfig, SectionConfig, Layer, TextLayer, ImageLayer, TentSectionId } from '../types/config';
import { UV_ZONES, SECTION_LIST, MASTER_TEXTURE_SIZE, UVZoneDefinition } from './uvZones';

export class TextureCompositor {
  private masterCanvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private isRendering = false;
  private needsRender = false;
  private lastConfig: ProductConfig | null = null;
  private onUpdateCallbacks: Set<() => void> = new Set();

  constructor() {
    this.masterCanvas = document.createElement('canvas');
    this.masterCanvas.width = MASTER_TEXTURE_SIZE;
    this.masterCanvas.height = MASTER_TEXTURE_SIZE;

    const context = this.masterCanvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error('Failed to create 2D canvas context for TextureCompositor');
    }
    this.ctx = context;

    // Create Three.js CanvasTexture
    this.texture = new THREE.CanvasTexture(this.masterCanvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.anisotropy = 16;
    this.texture.flipY = false; // glTF textures have (0,0) top-left
  }

  public getTexture(): THREE.CanvasTexture {
    return this.texture;
  }

  public getMasterCanvas(): HTMLCanvasElement {
    return this.masterCanvas;
  }

  public subscribe(callback: () => void): () => void {
    this.onUpdateCallbacks.add(callback);
    return () => {
      this.onUpdateCallbacks.delete(callback);
    };
  }

  public scheduleRender(config: ProductConfig): void {
    this.lastConfig = config;
    if (this.isRendering) {
      this.needsRender = true;
      return;
    }

    this.isRendering = true;
    requestAnimationFrame(async () => {
      try {
        if (this.lastConfig) {
          await this.renderSync(this.lastConfig);
        }
      } catch (err) {
        console.error('TextureCompositor render error:', err);
      } finally {
        this.isRendering = false;
        if (this.needsRender && this.lastConfig) {
          this.needsRender = false;
          this.scheduleRender(this.lastConfig);
        }
      }
    });
  }

  public async renderSync(config: ProductConfig): Promise<void> {
    const ctx = this.ctx;
    const size = MASTER_TEXTURE_SIZE;

    // 1. Fill entire master background with default or global color
    ctx.save();
    ctx.fillStyle = config.globalColor || '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // 2. Preload any image layers in all sections
    const imagePromises: Promise<void>[] = [];
    for (const sectionId of SECTION_LIST) {
      const section = config.sections[sectionId];
      if (!section) continue;
      for (const layer of section.layers) {
        if (layer.type === 'image' && !this.imageCache.has(layer.src)) {
          imagePromises.push(this.loadImage(layer.src));
        }
      }
    }
    if (imagePromises.length > 0) {
      await Promise.all(imagePromises);
    }

    // 3. Render each of the 8 UV zones
    for (const sectionId of SECTION_LIST) {
      const zoneDef = UV_ZONES[sectionId];
      const section = config.sections[sectionId];
      if (!zoneDef || !section) continue;

      this.renderSectionZone(zoneDef, section, config);
    }

    ctx.restore();

    // 4. Mark Three.js texture as dirty
    this.texture.needsUpdate = true;

    // Notify listeners (e.g. 2D proof thumbnail updates)
    for (const cb of this.onUpdateCallbacks) {
      cb();
    }
  }

  private renderSectionZone(zone: UVZoneDefinition, section: SectionConfig, config: ProductConfig): void {
    const ctx = this.ctx;

    // Determine background color
    const bgColor = config.useGlobalColor ? config.globalColor : section.backgroundColor;

    // We render the section upright into a temporary canvas
    const secCanvas = document.createElement('canvas');
    secCanvas.width = zone.editorWidth;
    secCanvas.height = zone.editorHeight;
    const sCtx = secCanvas.getContext('2d');
    if (!sCtx) return;

    // Clip to shape (triangle or rectangle)
    sCtx.save();
    if (zone.isTriangle) {
      sCtx.beginPath();
      sCtx.moveTo(zone.editorWidth / 2, 10); // Top apex
      sCtx.lineTo(zone.editorWidth - 10, zone.editorHeight - 10); // Bottom right
      sCtx.lineTo(10, zone.editorHeight - 10); // Bottom left
      sCtx.closePath();
      sCtx.fillStyle = bgColor;
      sCtx.fill();
      sCtx.clip();
    } else {
      sCtx.fillStyle = bgColor;
      sCtx.fillRect(0, 0, zone.editorWidth, zone.editorHeight);
      sCtx.beginPath();
      sCtx.rect(0, 0, zone.editorWidth, zone.editorHeight);
      sCtx.clip();
    }

    // Draw subtle grid or fabric texture lines for depth
    this.drawFabricTexture(sCtx, zone.editorWidth, zone.editorHeight);

    // Draw layers (text and images)
    for (const layer of section.layers) {
      this.drawLayer(sCtx, layer, zone.editorWidth, zone.editorHeight);
    }

    sCtx.restore();

    // Now project this upright section canvas onto the master UV canvas
    ctx.save();
    ctx.translate(zone.centerX, zone.centerY);
    ctx.rotate((zone.rotationDeg * Math.PI) / 180);

    // Center and draw using exact upright zone dimensions
    const drawW = zone.zoneWidth;
    const drawH = zone.zoneHeight;
    ctx.drawImage(secCanvas, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();
  }

  private drawLayer(ctx: CanvasRenderingContext2D, layer: Layer, canvasW: number, canvasH: number): void {
    ctx.save();

    // Layer position is normalized (0 to 1)
    const posX = layer.x * canvasW;
    const posY = layer.y * canvasH;

    ctx.translate(posX, posY);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.scale(layer.scale, layer.scale);
    ctx.globalAlpha = layer.opacity ?? 1.0;

    if (layer.type === 'text') {
      const textLayer = layer as TextLayer;
      ctx.fillStyle = textLayer.color || '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const weight = textLayer.fontWeight === '900' ? '900' : textLayer.fontWeight === 'bold' ? 'bold' : 'normal';
      ctx.font = `${weight} ${textLayer.fontSize}px "${textLayer.fontFamily || 'Inter'}", sans-serif`;

      // Optional text shadow for readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;

      ctx.fillText(textLayer.text, 0, 0);
    } else if (layer.type === 'image') {
      const imgLayer = layer as ImageLayer;
      const img = this.imageCache.get(imgLayer.src);
      if (img && img.complete) {
        // Base width for images
        const baseW = canvasW * 0.4;
        const baseH = baseW / (imgLayer.aspectRatio || 1);
        ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);
      }
    }

    ctx.restore();
  }

  private drawFabricTexture(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Add micro-grain fabric effect
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const step = 8;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private loadImage(src: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.imageCache.set(src, img);
        resolve();
      };
      img.onerror = () => {
        console.warn(`Failed to load image texture: ${src}`);
        resolve();
      };
      img.src = src;
    });
  }

  public getSectionDataURL(sectionId: TentSectionId, config: ProductConfig): string {
    const zone = UV_ZONES[sectionId];
    const section = config.sections[sectionId];
    if (!zone || !section) return '';

    const secCanvas = document.createElement('canvas');
    secCanvas.width = zone.editorWidth;
    secCanvas.height = zone.editorHeight;
    const sCtx = secCanvas.getContext('2d');
    if (!sCtx) return '';

    const bgColor = config.useGlobalColor ? config.globalColor : section.backgroundColor;
    sCtx.fillStyle = bgColor;
    sCtx.fillRect(0, 0, zone.editorWidth, zone.editorHeight);

    if (zone.isTriangle) {
      sCtx.beginPath();
      sCtx.moveTo(zone.editorWidth / 2, 10);
      sCtx.lineTo(zone.editorWidth - 10, zone.editorHeight - 10);
      sCtx.lineTo(10, zone.editorHeight - 10);
      sCtx.closePath();
      sCtx.clip();
    }

    for (const layer of section.layers) {
      this.drawLayer(sCtx, layer, zone.editorWidth, zone.editorHeight);
    }

    return secCanvas.toDataURL('image/png');
  }

  public getFullTextureProofURL(): string {
    return this.masterCanvas.toDataURL('image/png');
  }

  public dispose(): void {
    this.texture.dispose();
    this.imageCache.clear();
    this.onUpdateCallbacks.clear();
  }
}

// Singleton compositor instance
export const globalTextureCompositor = new TextureCompositor();
