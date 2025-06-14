import { DocumentEntity } from '../../../domain/entities/document.entity';

export interface OcrResult {
  success: boolean;
  extractedText?: string;
  confidence?: number;
  metadata?: {
    language?: string;
    blocks?: any[];
    timestamp: string;
  };
  error?: string;
}

export abstract class OcrClientPort {
  abstract extractTextFromImage(document: DocumentEntity): Promise<OcrResult>;
  abstract detectLanguage(document: DocumentEntity): Promise<string>;
  abstract validateImageFormat(document: DocumentEntity): Promise<boolean>;
}
