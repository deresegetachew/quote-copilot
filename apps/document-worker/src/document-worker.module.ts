import { Module } from '@nestjs/common';
import { DocumentWorkerController } from './document-worker.controller';
import { DocumentWorkerService } from './document-worker.service';
import { AppConfigModule } from '@app-config/config';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule.forRoot(), AppConfigModule.forRoot()],
  controllers: [DocumentWorkerController],
  providers: [DocumentWorkerService],
})
export class DocumentWorkerModule {}
