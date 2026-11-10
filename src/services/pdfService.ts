import { jsPDF } from 'jspdf';
import { ProductConfig, TENT_SIZES, FRAME_FINISHES } from '../types/config';
import { PricingBreakdown } from '../types/pricing';
import { PDFExportOptions } from '../types/pdf';

export class PDFService {
  private static instance: PDFService;

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  public async generateProductionPDF(
    config: ProductConfig,
    pricing: PricingBreakdown,
    snapshots: { render3D?: string; flatProof?: string },
    options: PDFExportOptions
  ): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = 14;

    // --- 1. HEADER BANNER ---
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, contentWidth, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('VERTICAL 3D TECH — PRODUCTION SPEC SHEET', margin + 6, y + 9);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('COMMERCIAL CANOPY TENT CUSTOMIZATION PROOF & ORDER MANIFEST', margin + 6, y + 15);
    doc.text(`CONFIG REF: #${config.id.toUpperCase()}`, margin + 6, y + 20);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246); // brand blue
    doc.text(`PROD. LEAD TIME: ${pricing.leadTimeDays} DAYS`, pageWidth - margin - 48, y + 9);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - margin - 48, y + 16);

    y += 30;

    // --- 2. ORDER & CLIENT INFO TABLE ---
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT / PROJECT:', margin + 4, y + 6);
    doc.text('PRINT TECHNOLOGY:', margin + 65, y + 6);
    doc.text('ORDER STATUS:', margin + 125, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(options.customerName || 'Demo Customer / Online Order', margin + 4, y + 11);
    doc.text(options.companyName || 'MVP Event Partner', margin + 4, y + 16);

    doc.text('Full-Color Dye-Sublimation (600D Poly)', margin + 65, y + 11);
    doc.text('CPAI-84 & NFPA-701 Flame Certified', margin + 65, y + 16);

    doc.setTextColor(16, 185, 129); // green
    doc.setFont('helvetica', 'bold');
    doc.text('APPROVED FOR PRODUCTION', margin + 125, y + 11);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Shopify Cart Integration Linked', margin + 125, y + 16);

    y += 27;

    // --- 3. HARDWARE & SPECIFICATIONS ---
    const sizeDef = TENT_SIZES.find((s) => s.id === config.size) || TENT_SIZES[0];
    const finishDef = FRAME_FINISHES.find((f) => f.id === config.frameFinish) || FRAME_FINISHES[0];

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('PRODUCT SPECIFICATIONS', margin, y + 2);
    y += 5;

    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, margin + contentWidth, y);
    y += 4;

    const accessoriesList = Object.entries(config.accessories)
      .filter(([_, active]) => active)
      .map(([key]) => {
        if (key === 'rollerBag') return 'Roller Bag';
        if (key === 'sandbags') return 'Sandbags (4x)';
        if (key === 'heavyDutyStakes') return 'Ground Stakes';
        if (key === 'flagMounts') return 'Flag Brackets';
        return key;
      });

    const specs = [
      ['Product Name', 'Custom Heavy-Duty Commercial Canopy Tent'],
      ['Canopy Size', `${sizeDef.label} (${sizeDef.dimensions})`],
      ['Frame Finish', `${finishDef.label} (40mm Commercial Hex Legs)`],
      ['Fabric Color', `${config.globalColor} (600D Weather-Resistant Poly)`],
      ['Order Quantity', `${pricing.quantity || 1} Unit(s)`],
      ['Selected Accessories', accessoriesList.length > 0 ? accessoriesList.join(', ') : 'None'],
      ['Fire / Safety Rating', 'CPAI-84 & NFPA-701 Flame Certified, UV 50+'],
    ];

    doc.setFontSize(8);
    specs.forEach(([k, v]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(k + ':', margin + 4, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(v, margin + 45, y);
      y += 5;
    });

    y += 2;

    // --- 4. VISUAL PROOFS (3D + FLAT 2D) ---
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('VISUAL PROOFS & PRINTING TEMPLATE', margin, y + 2);
    y += 5;
    doc.line(margin, y, margin + contentWidth, y);
    y += 4;

    const proofBoxW = (contentWidth - 6) / 2;
    const proofBoxH = 58;

    // 3D Snapshot box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, proofBoxW, proofBoxH, 2, 2, 'F');
    if (snapshots.render3D) {
      try {
        doc.addImage(snapshots.render3D, 'PNG', margin + 2, y + 2, proofBoxW - 4, proofBoxH - 4);
      } catch (e) {
        console.warn('Could not embed 3D snapshot in PDF', e);
      }
    }
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('3D PERSPECTIVE RENDERING', margin + 4, y + proofBoxH - 2);

    // 2D Flat UV Layout box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin + proofBoxW + 6, y, proofBoxW, proofBoxH, 2, 2, 'F');
    if (snapshots.flatProof) {
      try {
        doc.addImage(snapshots.flatProof, 'PNG', margin + proofBoxW + 8, y + 2, proofBoxW - 4, proofBoxH - 4);
      } catch (e) {
        console.warn('Could not embed flat proof in PDF', e);
      }
    }
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('2D UNFOLDED UV PRINT PATTERN', margin + proofBoxW + 10, y + proofBoxH - 2);

    y += proofBoxH + 6;

    // --- 5. CUSTOMIZED ZONES SUMMARY ---
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('CUSTOMIZED PRINTING ZONES DETAIL', margin, y + 2);
    y += 5;
    doc.line(margin, y, margin + contentWidth, y);
    y += 4;

    doc.setFontSize(7.5);
    let anyZoneCustomized = false;
    for (const [_secId, sec] of Object.entries(config.sections)) {
      if (sec.layers.length > 0) {
        anyZoneCustomized = true;
        const textLayers = sec.layers.filter((l) => l.type === 'text');
        const imgLayers = sec.layers.filter((l) => l.type === 'image');

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(`• ${sec.label}:`, margin + 4, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const details = [
          textLayers.length > 0 ? `Text: "${textLayers.map((t) => (t as any).text).join(', ')}"` : null,
          imgLayers.length > 0 ? `Logos: ${imgLayers.length} file(s) positioned` : null,
          !config.useGlobalColor ? `Color: ${sec.backgroundColor}` : null,
        ]
          .filter(Boolean)
          .join(' | ');

        doc.text(details, margin + 35, y);
        y += 4.5;
      }
    }

    if (!anyZoneCustomized) {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184);
      doc.text('Standard Solid Color Canopy (No custom logos or text added)', margin + 4, y);
      y += 5;
    }

    y += 2;

    // --- 6. ITEMIZED PRICING TABLE ---
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('COMMERCIAL PRICING BREAKDOWN', margin, y + 2);
    y += 5;
    doc.line(margin, y, margin + contentWidth, y);
    y += 4;

    // Header row
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 5, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Description', margin + 3, y + 3.5);
    doc.text('Qty', margin + 115, y + 3.5);
    doc.text('Unit Price', margin + 135, y + 3.5);
    doc.text('Total', margin + 162, y + 3.5);
    y += 6;

    // Line items
    doc.setFont('helvetica', 'normal');
    pricing.items.forEach((item) => {
      doc.setTextColor(51, 65, 85);
      doc.text(item.name.substring(0, 55), margin + 3, y + 3);
      doc.text(item.quantity.toString(), margin + 118, y + 3);
      doc.text(`$${item.unitPrice.toFixed(2)}`, margin + 137, y + 3);
      doc.text(`$${item.total.toFixed(2)}`, margin + 162, y + 3);
      y += 4.5;
    });

    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, margin + contentWidth, y);
    y += 4;

    // Total box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Subtotal:', margin + 120, y);
    doc.text(`$${pricing.subtotal.toFixed(2)}`, margin + 162, y);
    y += 4.5;

    if (pricing.discountAmount > 0) {
      doc.setTextColor(220, 38, 38);
      doc.text('Discount:', margin + 120, y);
      doc.text(`-$${pricing.discountAmount.toFixed(2)}`, margin + 162, y);
      y += 4.5;
    }

    doc.setTextColor(71, 85, 105);
    doc.text('Est. Tax (8.25%):', margin + 120, y);
    doc.text(`$${pricing.estimatedTax.toFixed(2)}`, margin + 162, y);
    y += 4.5;

    doc.text('Shipping:', margin + 120, y);
    doc.text(pricing.shipping === 0 ? 'FREE' : `$${pricing.shipping.toFixed(2)}`, margin + 162, y);
    y += 5.5;

    doc.setFillColor(15, 23, 42);
    doc.rect(margin + 115, y - 4, contentWidth - 115, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('FINAL TOTAL:', margin + 118, y + 1);
    doc.text(`$${pricing.totalPrice.toFixed(2)} USD`, margin + 155, y + 1);

    y += 12;

    // --- 7. FOOTER & COMPLIANCE ---
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'This production sheet is an official digital proof generated by the Interactive Product Configurator for Vertical 3D Tech assessment.',
      margin,
      pageHeight - 8
    );
    doc.text(`Doc Ref: SHA256-${config.id.substring(0, 16)} | Page 1 of 1`, pageWidth - margin - 50, pageHeight - 8);

    return doc.output('blob');
  }

  public downloadPDF(blob: Blob, filename = 'Canopy_Tent_Production_Spec.pdf'): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const pdfService = PDFService.getInstance();
