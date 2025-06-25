import { DocumentEntity } from '../../../domain/entities/document.entity';

export abstract class DocumentRepositoryPort {
  abstract save(document: DocumentEntity): Promise<void>;
  abstract findById(id: string): Promise<DocumentEntity | null>;
  abstract findByFileName(fileName: string): Promise<DocumentEntity[]>;
  abstract delete(id: string): Promise<void>;
  abstract updateStatus(id: string, status: string): Promise<void>;
}
