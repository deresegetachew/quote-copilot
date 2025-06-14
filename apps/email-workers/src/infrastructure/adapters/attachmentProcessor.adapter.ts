import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AttachmentProcessorPort,
  AttachmentMetadata,
  ProcessedAttachment,
  AttachmentProcessingConfig,
} from '../../application/ports/outgoing/attachmentProcessor.port';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AttachmentProcessorAdapter extends AttachmentProcessorPort {
  private readonly logger = new Logger(AttachmentProcessorAdapter.name);
  private readonly config: AttachmentProcessingConfig;

  constructor(private configService: ConfigService) {
    super();
    this.config = this.configService.getOrThrow('attachmentConfig');
  }

  async downloadAttachment(
    attachmentId: string,
    messageId: string,
  ): Promise<Buffer> {
    // TODO: Integrate with Gmail API to download attachment
    // For now, return empty buffer as placeholder
    this.logger.log(`Downloading attachment ${attachmentId} from message ${messageId}`);
    
    // Security: Log all download attempts for audit
    this.logger.warn(`SECURITY_AUDIT: Attachment download requested - ID: ${attachmentId}, Message: ${messageId}`);
    
    return Buffer.alloc(0);
  }

  async validateAttachment(
    buffer: Buffer,
    metadata: AttachmentMetadata,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // 1. File Size Validation
    if (buffer.length > this.config.maxFileSize) {
      errors.push(`File size ${buffer.length} exceeds maximum ${this.config.maxFileSize} bytes`);
    }

    // 2. MIME Type Validation (Whitelist approach)
    if (!this.config.allowedMimeTypes.includes(metadata.mimeType)) {
      errors.push(`MIME type ${metadata.mimeType} is not allowed`);
    }

    // 3. File Extension vs MIME Type Validation
    const expectedExtensions = this.getExpectedExtensions(metadata.mimeType);
    const actualExtension = path.extname(metadata.filename).toLowerCase();
    if (!expectedExtensions.includes(actualExtension)) {
      errors.push(`File extension ${actualExtension} doesn't match MIME type ${metadata.mimeType}`);
    }

    // 4. Filename Security Check
    if (this.hasUnsafeFilename(metadata.filename)) {
      errors.push('Filename contains unsafe characters');
    }

    // 5. Magic Number Validation (File signature check)
    if (!this.validateFileSignature(buffer, metadata.mimeType)) {
      errors.push('File signature does not match declared MIME type');
    }

    const isValid = errors.length === 0;
    
    if (!isValid) {
      this.logger.warn(`SECURITY_ALERT: Invalid attachment detected`, {
        filename: metadata.filename,
        mimeType: metadata.mimeType,
        size: metadata.size,
        errors,
      });
    }

    return { isValid, errors };
  }

  async scanForThreats(
    buffer: Buffer,
    filename: string,
  ): Promise<{ isSafe: boolean; threats: string[] }> {
    const threats: string[] = [];

    // 1. Hash-based threat detection
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
    
    // TODO: Integrate with virus scanning service (ClamAV, VirusTotal ...
    // For now, implement basic threat detection

    // 2. Suspicious content patterns
    const suspiciousPatterns = [
      /javascript:/gi,
      /<script[^>]*>/gi,
      /eval\s*\(/gi,
      /document\.write/gi,
      /window\.location/gi,
    ];

    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 10000));
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        threats.push(`Suspicious pattern detected: ${pattern.source}`);
      }
    }

    // 3. Zip bomb detection (for compressed content)
    if (this.isPotentialZipBomb(buffer)) {
      threats.push('Potential zip bomb detected');
    }

    const isSafe = threats.length === 0;

    if (!isSafe) {
      this.logger.error(`SECURITY_THREAT: Threats detected in attachment`, {
        filename,
        fileHash,
        threats,
      });
    }

    return { isSafe, threats };
  }

  async processAttachment(
    buffer: Buffer,
    metadata: AttachmentMetadata,
  ): Promise<ProcessedAttachment> {
    const startTime = Date.now();

    try {
      // 1. Validation
      const validation = await this.validateAttachment(buffer, metadata);
      if (!validation.isValid) {
        return {
          metadata,
          content: {},
          securityScan: { isSafe: false, threats: validation.errors, scanTime: new Date() },
          processingStatus: 'FAILED',
          errorMessage: validation.errors.join('; '),
        };
      }

      // 2. Security Scan
      const securityScan = await this.scanForThreats(buffer, metadata.filename);
      if (!securityScan.isSafe) {
        return {
          metadata,
          content: {},
          securityScan: { ...securityScan, scanTime: new Date() },
          processingStatus: 'QUARANTINED',
          errorMessage: 'File failed security scan',
        };
      }

      // 3. Content Extraction (with timeout)
      const content = await Promise.race([
        this.extractContent(buffer, metadata.mimeType),
        this.createTimeout(this.config.processingTimeoutMs),
      ]);

      return {
        metadata,
        content,
        securityScan: { ...securityScan, scanTime: new Date() },
        processingStatus: 'SUCCESS',
      };

    } catch (error) {
      this.logger.error(`Error processing attachment: ${error.message}`, {
        filename: metadata.filename,
        error: error.stack,
      });

      return {
        metadata,
        content: {},
        securityScan: { isSafe: false, threats: ['Processing error'], scanTime: new Date() },
        processingStatus: 'FAILED',
        errorMessage: error.message,
      };
    }
  }

  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    // TODO: Implement with pdf-parse library
    // Security: Run in sandboxed environment
    this.logger.log('Extracting text from PDF (placeholder)');
    return 'PDF text extraction not implemented yet';
  }

  async parseCsvContent(buffer: Buffer): Promise<{
    headers: string[];
    rows: string[][];
  }> {
    try {
      const content = buffer.toString('utf8');
      
      // Basic CSV parsing with security limits
      const lines = content.split('\n').slice(0, 1000); // Limit to 1000 rows
      if (lines.length === 0) return { headers: [], rows: [] };

      const headers = this.parseCsvLine(lines[0]).slice(0, 50); // Limit to 50 columns
      const rows = lines.slice(1)
        .filter(line => line.trim())
        .map(line => this.parseCsvLine(line).slice(0, 50));

      return { headers, rows };
    } catch (error) {
      this.logger.error(`CSV parsing error: ${error.message}`);
      throw new Error('Failed to parse CSV content');
    }
  }

  async cleanupTemporaryFiles(olderThanDays: number): Promise<void> {
    // TODO: Implement cleanup of temporary attachment files
    this.logger.log(`Cleaning up temporary files older than ${olderThanDays} days`);
  }

  // Private helper methods

  private getExpectedExtensions(mimeType: string): string[] {
    const mapping: Record<string, string[]> = {
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    };
    return mapping[mimeType] || [];
  }

  private hasUnsafeFilename(filename: string): boolean {
    // Check for path traversal and dangerous characters
    const unsafePatterns = [
      /\.\./,           // Path traversal
      /[<>:"|?*]/,      // Windows invalid chars
      /[\x00-\x1f]/,    // Control characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
    ];

    return unsafePatterns.some(pattern => pattern.test(filename));
  }

  private validateFileSignature(buffer: Buffer, mimeType: string): boolean {
    if (buffer.length < 4) return false;

    const signatures: Record<string, Buffer[]> = {
      'application/pdf': [Buffer.from([0x25, 0x50, 0x44, 0x46])], // %PDF
      'text/csv': [Buffer.from('data'), Buffer.from('name')], // Basic CSV headers
    };

    const expectedSignatures = signatures[mimeType];
    if (!expectedSignatures) return true; // No signature check available

    return expectedSignatures.some(signature =>
      buffer.subarray(0, signature.length).equals(signature)
    );
  }

  private isPotentialZipBomb(buffer: Buffer): boolean {
    // Basic zip bomb detection
    // Look for high compression ratios or nested structures
    const compressionRatio = buffer.length / (buffer.filter(b => b !== 0).length || 1);
    return compressionRatio > 100; // Suspicious if mostly zeros
  }

  private async extractContent(buffer: Buffer, mimeType: string): Promise<any> {
    switch (mimeType) {
      case 'text/csv':
        return { tables: [await this.parseCsvContent(buffer)] };
      case 'application/pdf':
        return { text: await this.extractTextFromPdf(buffer) };
      default:
        return { text: 'Unsupported file type for content extraction' };
    }
  }

  private parseCsvLine(line: string): string[] {
    // Simple CSV line parser (for demo - use proper library in production)
    return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
  }

  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Processing timeout')), ms);
    });
  }
} 