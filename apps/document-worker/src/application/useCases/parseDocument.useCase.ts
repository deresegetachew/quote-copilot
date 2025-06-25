import { Injectable } from '@nestjs/common';
import { DocumentRepositoryPort } from '../ports/outgoing/documentRepository.port';

export interface ParseDocumentCommand {
  documentId: string;
}

@Injectable()
export class ParseDocumentUseCase {
  constructor(private readonly documentRepository: DocumentRepositoryPort) {}

  async execute(command: ParseDocumentCommand): Promise<any> {
    console.log('📖 Parsing document:', command.documentId);

    // try {
    //   // Validate document ID
    //   const documentId = new DocumentId(command.documentId);

    //   // Retrieve document from repository
    //   const document = await this.documentRepository.findById(
    //     documentId.getValue(),
    //   );

    //   if (!document) {
    //     return {
    //       success: false,
    //       message: 'Document not found',
    //       documentId: command.documentId,
    //       timestamp: new Date().toISOString(),
    //     };
    //   }

    //   // Check if document is already processed
    //   if (
    //     document.getStatus() === DocumentStatus.PROCESSED &&
    //     document.getExtractedText()
    //   ) {
    //     return {
    //       success: true,
    //       message: 'Document already parsed',
    //       documentId: document.getId(),
    //       extractedData: {
    //         text: document.getExtractedText(),
    //         metadata: document.getMetadata(),
    //         fileName: document.getFileName(),
    //         mimeType: document.getMimeType(),
    //         status: document.getStatus(),
    //       },
    //       timestamp: new Date().toISOString(),
    //     };
    //   }

    //   // Parse document content
    //   const parseResult =
    //     await this.documentProcessingService.parseDocument(document);

    //   if (parseResult.success) {
    //     // Update document with parsed content if not already set
    //     if (!document.getExtractedText() && parseResult.extractedText) {
    //       document.setExtractedText(parseResult.extractedText);
    //       document.setStatus(DocumentStatus.PROCESSED);
    //       await this.documentRepository.save(document);
    //     }

    //     return {
    //       success: true,
    //       message: 'Document parsing completed',
    //       documentId: document.getId(),
    //       extractedData: {
    //         text: parseResult.extractedText,
    //         metadata: {
    //           ...document.getMetadata(),
    //           ...parseResult.metadata,
    //         },
    //         fileName: document.getFileName(),
    //         mimeType: document.getMimeType(),
    //         status: document.getStatus(),
    //       },
    //       timestamp: new Date().toISOString(),
    //     };
    //   } else {
    //     document.setStatus(DocumentStatus.FAILED);
    //     await this.documentRepository.save(document);

    //     return {
    //       success: false,
    //       message: 'Document parsing failed',
    //       documentId: document.getId(),
    //       error: parseResult.error,
    //       timestamp: new Date().toISOString(),
    //     };
    //   }
    // } catch (error) {
    //   console.error('Error parsing document:', error);
    //   return {
    //     success: false,
    //     message: 'Failed to parse document',
    //     documentId: command.documentId,
    //     error: error.message,
    //     timestamp: new Date().toISOString(),
    //   };
    // }
  }
}
