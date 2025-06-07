import { Module } from '@nestjs/common';
import { DocumentWorkerController } from './document-worker.controller';
import { DocumentWorkerService } from './document-worker.service';

@Module({
  imports: [],
  controllers: [DocumentWorkerController],
  providers: [DocumentWorkerService],
})
export class DocumentWorkerModule {}
