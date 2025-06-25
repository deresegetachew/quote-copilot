import { Injectable } from '@nestjs/common';
import {
  DocumentEntity,
  DocumentStatus,
} from '../../domain/entities/document.entity';
import { DocumentId } from '../../domain/valueObjects/documentId.vo';
import { DocumentTypeVO } from '../../domain/valueObjects/documentType.vo';
import { DocumentRepositoryPort } from '../ports/outgoing/documentRepository.port';

export interface ProcessDocumentCommand {
  documentId?: string;
  fileName: string;
  mimeType: string;
  content: Buffer | string;
  metadata?: any;
}

@Injectable()
export class ProcessDocumentUseCase {
  constructor(
    private readonly documentRepository: DocumentRepositoryPort,
    // private readonly documentProcessingService: DocumentProcessingServicePort,
  ) {}

  async execute(command: ProcessDocumentCommand): Promise<any> {
    console.log('🔄 Processing document:', command.fileName);

    // try {
    //   // Validate document type
    //   const documentType = new DocumentTypeVO(command.mimeType);

    //   // Create document entity
    //   const documentId = command.documentId
    //     ? new DocumentId(command.documentId)
    //     : DocumentId.generate();

    //   const document = new DocumentEntity({
    //     id: documentId.getValue(),
    //     fileName: command.fileName,
    //     mimeType: command.mimeType,
    //     content: command.content,
    //     metadata: {
    //       size: Buffer.isBuffer(command.content)
    //         ? command.content.length
    //         : Buffer.from(command.content).length,
    //       ...command.metadata,
    //     },
    //     status: DocumentStatus.PROCESSING,
    //   });

    //   // Save document
    //   await this.documentRepository.save(document);

    //   // Process document asynchronously
    //   this.processDocumentAsync(document);

    //   return {
    //     success: true,
    //     message: 'Document processing started',
    //     documentId: documentId.getValue(),
    //     fileName: command.fileName,
    //     status: DocumentStatus.PROCESSING,
    //     timestamp: new Date().toISOString(),
    //   };
    // } catch (error) {
    //   console.error('Error processing document:', error);
    //   return {
    //     success: false,
    //     message: 'Failed to start document processing',
    //     error: error.message,
    //     timestamp: new Date().toISOString(),
    //   };
    // }
  }

  // private async processDocumentAsync(document: DocumentEntity): Promise<void> {
  //   try {
  //     // Extract text from document
  //     const result = await this.documentProcessingService.extractText(document);

  //     if (result.success && result.extractedText) {
  //       document.setExtractedText(result.extractedText);
  //       document.setStatus(DocumentStatus.PROCESSED);
  //     } else {
  //       document.setStatus(DocumentStatus.FAILED);
  //     }

  //     // Update document in repository
  //     await this.documentRepository.save(document);

  //     console.log(
  //       `✅ Document processing completed for: ${document.getFileName()}`,
  //     );
  //   } catch (error) {
  //     console.error('Error in async document processing:', error);
  //     document.setStatus(DocumentStatus.FAILED);
  //     await this.documentRepository.save(document);
  //   }
  // }
}
