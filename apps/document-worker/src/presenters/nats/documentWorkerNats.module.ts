import { Module } from '@nestjs/common';
import { ParseDocumentController } from './parseDocument.controller';

@Module({
  controllers: [ParseDocumentController],
})
export class DocumentWorkerNatsModule {}
