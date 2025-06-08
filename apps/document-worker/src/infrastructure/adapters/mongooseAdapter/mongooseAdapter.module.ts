import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentRepositoryPort } from '../../../application/ports/outgoing/documentRepository.port';
import { DocumentRepositoryAdapter } from './documentRepository.adapter';
import {
  DocumentSchema,
  DocumentSchemaFactory,
} from '../../database/mongo/schemas/document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentSchema.name, schema: DocumentSchemaFactory },
    ]),
  ],
  providers: [
    DocumentRepositoryAdapter,
    {
      provide: DocumentRepositoryPort,
      useClass: DocumentRepositoryAdapter,
    },
  ],
  exports: [DocumentRepositoryPort],
})
export class MongooseAdapterModule {}
