import { DocumentEntity } from '../../../domain/entities/document.entity';

export interface PDFExtractionResult {
  success: boolean;
  extractedText?: string;
  metadata?: {
    pageCount?: number;
    author?: string;
    title?: string;
    creationDate?: Date;
    extractionMethod: 'text-layer' | 'ocr' | 'hybrid';
    timestamp: string;
  };
  error?: string;
}

export abstract class PDFClientPort {
  abstract extractTextFromPDF(
    document: DocumentEntity,
  ): Promise<PDFExtractionResult>;
  abstract extractMetadata(
    document: DocumentEntity,
  ): Promise<PDFExtractionResult>;
  abstract validatePDFFormat(document: DocumentEntity): Promise<boolean>;
  abstract getPageCount(document: DocumentEntity): Promise<number>;
}
