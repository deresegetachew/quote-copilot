import { Module } from '@nestjs/common';
import { DocumentWorkerController } from './document-worker.controller';
import { DocumentWorkerApplicationModule } from '../../application/documentWorkerApplication.module';

@Module({
  imports: [DocumentWorkerApplicationModule],
  controllers: [DocumentWorkerController],
})
export class DocumentWorkerHttpModule {}
