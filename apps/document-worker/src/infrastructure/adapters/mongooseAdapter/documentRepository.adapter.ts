import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentRepositoryPort } from '../../../application/ports/outgoing/documentRepository.port';
import {
  DocumentEntity,
  DocumentStatus,
} from '../../../domain/entities/document.entity';
import { DocumentId } from '../../../domain/valueObjects/documentId.vo';
import {
  DocumentDocument,
  DocumentSchema,
} from '../../database/mongo/schemas/document.schema';
import { DocumentMapper } from '../../database/mongo/mappers/document.mapper';

@Injectable()
export class DocumentRepositoryAdapter extends DocumentRepositoryPort {
  private logger = new Logger(DocumentRepositoryAdapter.name);

  constructor(
    @InjectModel(DocumentSchema.name)
    private readonly documentModel: Model<DocumentDocument>,
  ) {
    super();
  }

  async save(document: DocumentEntity): Promise<void> {
    this.logger.log(`Saving document: ${document.getId()}`);

    const documentData = DocumentMapper.toDocument(document);

    await this.documentModel.updateOne(
      { documentId: document.getId() },
      { $set: documentData },
      { upsert: true },
    );

    this.logger.log(`Document saved successfully: ${document.getId()}`);
  }

  async findById(id: string): Promise<DocumentEntity | null> {
    this.logger.log(`Finding document by ID: ${id}`);

    const documentDoc = await this.documentModel
      .findOne({ documentId: id })
      .exec();

    if (!documentDoc) {
      this.logger.log(`Document not found: ${id}`);
      return null;
    }

    this.logger.log(`Document found: ${id}`);
    return DocumentMapper.toDomain(documentDoc);
  }

  async findByFileName(fileName: string): Promise<DocumentEntity[]> {
    this.logger.log(`Finding documents by filename: ${fileName}`);

    const documentDocs = await this.documentModel
      .find({ fileName: { $regex: fileName, $options: 'i' } })
      .exec();

    this.logger.log(
      `Found ${documentDocs.length} documents with filename: ${fileName}`,
    );
    return documentDocs.map((doc) => DocumentMapper.toDomain(doc));
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting document: ${id}`);

    const result = await this.documentModel.deleteOne({ documentId: id });

    if (result.deletedCount === 0) {
      this.logger.warn(`Document not found for deletion: ${id}`);
      throw new Error(`Document with ID ${id} not found`);
    }

    this.logger.log(`Document deleted successfully: ${id}`);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    this.logger.log(`Updating document status: ${id} -> ${status}`);

    const result = await this.documentModel.updateOne(
      { documentId: id },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      this.logger.warn(`Document not found for status update: ${id}`);
      throw new Error(`Document with ID ${id} not found`);
    }

    this.logger.log(`Document status updated successfully: ${id}`);
  }
}
