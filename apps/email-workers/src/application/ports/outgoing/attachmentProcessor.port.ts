export interface AttachmentMetadata {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
  messageId: string;
  threadId: string;
}

export interface ProcessedAttachment {
  metadata: AttachmentMetadata;
  content: {
    text?: string;           // Extracted text content
    tables?: Array<{         // For CSV/Excel data
      headers: string[];
      rows: string[][];
    }>;
    images?: Array<{         // For image/OCR content
      text: string;
      confidence: number;
    }>;
  };
  securityScan: {
    isSafe: boolean;
    threats: string[];
    scanTime: Date;
  };
  processingStatus: 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'QUARANTINED';
  errorMessage?: string;
}

export interface AttachmentProcessingConfig {
  maxFileSize: number;        // 10MB default
  allowedMimeTypes: string[]; // Whitelist approach
  enableVirusScanning: boolean;
  enableContentScanning: boolean;
  tempDirectory: string;
  retentionPeriod: number;    // Days to keep files
  processingTimeoutMs: number; // Processing timeout in milliseconds
}

export abstract class AttachmentProcessorPort {
  abstract downloadAttachment(
    attachmentId: string,
    messageId: string,
  ): Promise<Buffer>;

  abstract validateAttachment(
    buffer: Buffer,
    metadata: AttachmentMetadata,
  ): Promise<{ isValid: boolean; errors: string[] }>;

  abstract scanForThreats(
    buffer: Buffer,
    filename: string,
  ): Promise<{ isSafe: boolean; threats: string[] }>;

  abstract processAttachment(
    buffer: Buffer,
    metadata: AttachmentMetadata,
  ): Promise<ProcessedAttachment>;

  abstract extractTextFromPdf(buffer: Buffer): Promise<string>;

  abstract parseCsvContent(buffer: Buffer): Promise<{
    headers: string[];
    rows: string[][];
  }>;

  abstract cleanupTemporaryFiles(olderThanDays: number): Promise<void>;
} 