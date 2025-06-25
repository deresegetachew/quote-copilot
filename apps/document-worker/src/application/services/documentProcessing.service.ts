import { Injectable, Logger } from '@nestjs/common';
import { DocumentEntity } from '../../domain/entities/document.entity';
import { DocParserClientAdapterFactory } from '../../infrastructure/adapters/docParserClientAdapters/docParserClientAdapter.factory';

export interface ProcessingResult {
  success: boolean;
  extractedText?: string;
  metadata?: Record<string, any>;
  error?: string;
}

@Injectable()
export class DocumentProcessingService {
  private readonly logger = new Logger(DocumentProcessingService.name);

  constructor(
    private readonly docParserFactory: DocParserClientAdapterFactory,
  ) {}

  // async processDocument(document: DocumentEntity): Promise<ProcessingResult> {
  //   this.logger.log(`Processing document: ${document.getFileName()}`);

  //   // try {
  //   //   const mimeType = document.getMimeType();
  //   //   let result: ProcessingResult;

  //   //   // Route to appropriate processing service based on MIME type
  //   //   if (mimeType === 'application/pdf') {
  //   //     result = await this.pdfProcessingService.extractText(document);
  //   //   } else if (mimeType.startsWith('image/')) {
  //   //     result = await this.ocrService.extractTextFromImage(document);
  //   //   } else if (
  //   //     mimeType === 'text/plain' ||
  //   //     mimeType.includes('word') ||
  //   //     mimeType.includes('document') ||
  //   //     mimeType.includes('spreadsheet')
  //   //   ) {
  //   //     result = await this.documentParsingService.parseDocument(document);
  //   //   } else {
  //   //     // Fallback to document parsing service for unknown types
  //   //     result = await this.documentParsingService.parseDocument(document);
  //   //   }

  //   //   this.logger.log(
  //   //     `Document processing completed for: ${document.getFileName()}`,
  //   //   );

  //   //   return result;
  //   // } catch (error) {
  //   //   this.logger.error(
  //   //     `Document processing failed for ${document.getFileName()}:`,
  //   //     error,
  //   //   );

  //   //   return {
  //   //     success: false,
  //   //     error: error.message || 'Unknown processing error',
  //   //   };
  //   // }
  // }

  // async extractText(document: DocumentEntity): Promise<ProcessingResult> {
  //   return this.processDocument(document);
  // }

  // async extractMetadata(document: DocumentEntity): Promise<ProcessingResult> {
  //   this.logger.log(`Extracting metadata from: ${document.getFileName()}`);

  //   try {
  //     const metadata = {
  //       fileName: document.getFileName(),
  //       mimeType: document.getMimeType(),
  //       size: document.getSize(),
  //       createdAt: document.getCreatedAt(),
  //       processedAt: new Date(),
  //       ...document.getMetadata(),
  //     };

  //     return {
  //       success: true,
  //       metadata,
  //     };
  //   } catch (error) {
  //     this.logger.error(
  //       `Metadata extraction failed for ${document.getFileName()}:`,
  //       error,
  //     );

  //     return {
  //       success: false,
  //       error: error.message || 'Metadata extraction error',
  //     };
  //   }
  // }

  // async validateDocument(document: DocumentEntity): Promise<boolean> {
  //   this.logger.log(`Validating document: ${document.getFileName()}`);

  //   try {
  //     // Basic validation checks
  //     if (!document.getContent() || document.getSize() === 0) {
  //       return false;
  //     }

  //     if (!document.getMimeType()) {
  //       return false;
  //     }

  //     // Additional validation based on type
  //     const mimeType = document.getMimeType();

  //     if (mimeType === 'application/pdf') {
  //       return await this.pdfProcessingService.validatePdf(document);
  //     } else if (mimeType.startsWith('image/')) {
  //       return await this.ocrService.validateImage(document);
  //     } else {
  //       return await this.documentParsingService.validateDocument(document);
  //     }
  //   } catch (error) {
  //     this.logger.error(
  //       `Document validation failed for ${document.getFileName()}:`,
  //       error,
  //     );
  //     return false;
  //   }
  // }
}
