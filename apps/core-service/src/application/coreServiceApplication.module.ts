import { Module, Provider } from '@nestjs/common';
import { ProcessRFQUseCase } from './useCases/processRFQ.useCase';
import { AppConfigModule, TConfiguration } from '@app-config/config';
import { CoreServiceController } from '../presenters/http/core-service.controller';
import { MessageIntentUseCase } from './useCases/messageIntent/messageIntent.useCase';
import { CommonClientsModule } from '@common/clients/commonClients.module';
import { LangChainModule } from '@tools-langchain';
import { CoreServiceInfrastructureModule } from '../infrastructure/coreServiceInfrastructure.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_SERVICE } from '@common';

// Import query handlers
import { GetRFQsQueryHandler } from './queryHandlers/getRFQs.queryHandler';
import { GetRFQMetricsQueryHandler } from './queryHandlers/getRFQMetrics.queryHandler';
import { GetProcessedEmailsQueryHandler } from './queryHandlers/getProcessedEmails.queryHandler';
import { GetRFQByIdQueryHandler } from './queryHandlers/getRFQById.queryHandler';

const integrationEventHandlers = [];
const useCases: Provider[] = [ProcessRFQUseCase, MessageIntentUseCase];
const queryHandlers: Provider[] = [
  GetRFQsQueryHandler,
  GetRFQMetricsQueryHandler,
  GetProcessedEmailsQueryHandler,
  GetRFQByIdQueryHandler,
];

@Module({
  imports: [
    CqrsModule,
    LangChainModule,
    CommonClientsModule,
    CoreServiceInfrastructureModule,
    AppConfigModule.forRoot(),
    // Add NATS client for event emission
    ClientsModule.registerAsync([
      {
        name: NATS_SERVICE,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.NATS,
          options: {
            servers: configService.getOrThrow<TConfiguration['natsConfig']>('natsConfig').url,
          },
        }),
      },
    ]),
  ],
  controllers: [...integrationEventHandlers, CoreServiceController],
  providers: [...useCases, ...queryHandlers],
  exports: [...useCases, ...queryHandlers],
})
export class CoreServiceApplicationModule {}
