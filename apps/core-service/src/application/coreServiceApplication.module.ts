import { Module, Provider } from '@nestjs/common';
import { ProcessRFQUseCase } from './useCases/processRFQ/processRFQ.useCase';
import { AppConfigModule } from '@app-config/config';
import { CoreServiceController } from '../presenters/http/core-service.controller';
import { MessageIntentUseCase } from './useCases/messageIntent/messageIntent.useCase';
import { SendConfirmationMessageUseCase } from './useCases/sendConfimationMessage/sendConfirmationMessage.useCase';
import { sendConfirmationEmailOnParsedRFQHandler } from './domainEventHandlers/rfqParsed/sendConfirmationMessageOnRFQParsed.handler';
import { CommonClientsModule } from '@common/clients/commonClients.module';
import { LangChainModule } from '@tools-langchain';
import { CoreServiceInfrastructureModule } from '../infrastructure/coreServiceInfrastructure.module';

const integrationEventHandlers = [];
const domainEventHandlers: Provider[] = [
  sendConfirmationEmailOnParsedRFQHandler,
];
const useCases: Provider[] = [
  ProcessRFQUseCase,
  MessageIntentUseCase,
  SendConfirmationMessageUseCase,
];

@Module({
  imports: [
    LangChainModule,
    CommonClientsModule,
    CoreServiceInfrastructureModule,
    AppConfigModule.forRoot(),
  ],
  controllers: [...integrationEventHandlers, CoreServiceController],
  providers: [...useCases, ...domainEventHandlers],
  exports: [...useCases, ...domainEventHandlers],
})
export class CoreServiceApplicationModule {}
