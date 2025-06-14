import { Module } from '@nestjs/common';
import { DocumentWorkerHttpModule } from './http/documentWorkerHttp.module';
import { DocumentWorkerNatsModule } from './nats/documentWorkerNats.module';

@Module({
  imports: [DocumentWorkerHttpModule, DocumentWorkerNatsModule],
})
export class DocumentWorkerPresenterModule {}
