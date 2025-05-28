import { Module, Provider } from '@nestjs/common';
import { ProcessRFQUseCase } from './useCases/processRFQ.useCase';
import { UnprocessableMsgHandler } from './integrationEventHandlers';
import { AppConfigModule } from '@app-config/config';
import { CoreServiceController } from '../presenters/http/core-service.controller';
import { MessageIntentUseCase } from './useCases/messageIntent/messageIntent.useCase';
import { CommonClientsModule } from '@common/clients/commonClients.module';
import { LangChainModule } from '@tools-langchain';
import { CoreServiceInfrastructureModule } from '../infrastructure/coreServiceInfrastructure.module';

const integrationEventHandlers = [UnprocessableMsgHandler];
const useCases: Provider[] = [ProcessRFQUseCase, MessageIntentUseCase];

@Module({
  imports: [
    LangChainModule,
    CommonClientsModule,
    CoreServiceInfrastructureModule,
    AppConfigModule.forRoot(),
  ],
  controllers: [...integrationEventHandlers, CoreServiceController],
  providers: [...useCases],
  exports: [...useCases],
})
export class CoreServiceApplicationModule {}
