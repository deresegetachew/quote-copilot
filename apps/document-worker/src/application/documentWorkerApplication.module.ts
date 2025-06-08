import { Module, Provider } from '@nestjs/common';
import { DocumentWorkerInfrastructureModule } from '../infrastructure/documentWorkerInfrastructure.module';
import { ProcessDocumentUseCase } from './useCases/processDocument.useCase';
import { ParseDocumentUseCase } from './useCases/parseDocument.useCase';
import { DocumentProcessingService } from './services/documentProcessing.service';
import { LangChainModule } from '@tools-langchain';
import { CommonClientsModule } from '@common/clients/commonClients.module';
import { AppConfigModule } from '@app-config/config';

const useCases: Provider[] = [ProcessDocumentUseCase, ParseDocumentUseCase];
const services: Provider[] = [DocumentProcessingService];

@Module({
  imports: [
    DocumentWorkerInfrastructureModule,
    LangChainModule,
    CommonClientsModule,
    AppConfigModule.forRoot(),
  ],
  providers: [...useCases, ...services],
  exports: [...useCases, ...services],
})
export class DocumentWorkerApplicationModule {}
