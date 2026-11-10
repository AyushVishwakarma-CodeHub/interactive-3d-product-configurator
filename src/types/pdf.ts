export interface PDFExportOptions {
  include3DSnapshots: boolean;
  includePrintProofs: boolean;
  includePriceBreakdown: boolean;
  customerName?: string;
  companyName?: string;
  email?: string;
  orderNotes?: string;
}

export interface PDFExportData {
  configId: string;
  orderNumber: string;
  snapshots: {
    frontAngle?: string;
    isometricAngle?: string;
    flatProof?: string;
  };
}

