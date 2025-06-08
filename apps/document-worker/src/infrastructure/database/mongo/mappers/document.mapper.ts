import {
  DocumentEntity,
  DocumentStatus,
} from '../../../../domain/entities/document.entity';
import { DocumentDocument } from '../schemas/document.schema';

export class DocumentMapper {
  static toDomain(documentDoc: DocumentDocument): DocumentEntity {
    return new DocumentEntity({
      id: documentDoc.documentId,
      fileName: documentDoc.fileName,
      mimeType: documentDoc.mimeType,
      content: documentDoc.content,
      metadata: documentDoc.metadata,
      status: documentDoc.status as DocumentStatus,
      extractedText: documentDoc.extractedText,
      createdAt: documentDoc.createdAt,
      updatedAt: documentDoc.updatedAt,
    });
  }

  static toDocument(document: DocumentEntity): Partial<DocumentDocument> {
    return {
      documentId: document.getId(),
      fileName: document.getFileName(),
      mimeType: document.getMimeType(),
      content: Buffer.isBuffer(document.getContent())
        ? (document.getContent() as Buffer)
        : Buffer.from(document.getContent() as string),
      metadata: document.getMetadata(),
      status: document.getStatus(),
      extractedText: document.getExtractedText(),
      createdAt: document.getCreatedAt(),
      updatedAt: document.getUpdatedAt(),
    };
  }
}
