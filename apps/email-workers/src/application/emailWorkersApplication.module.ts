import { Module, Provider } from '@nestjs/common';
import { EmailWorkersDomainModule } from '../domain/emailWorkersDomain.module';
import { EmailWorkersInfrastructureModule } from '../infrastructure/emailWorkersInfrastructure.module';
import { GetUnreadEmailsUseCase } from './useCases/emailUseCases/getUnreadEmails.useCase';
import { TriggerEmailProcessingUseCase } from './useCases/wfUseCases/triggerEmailProcessing.useCase';
import { GetEmailThreadMessagesUseCase } from './useCases/emailUseCases/getEmailThreadMessages.useCase';
import { EventPublishersModule } from '@common/eventPublishers/eventPublishers.module';
import { TriggerWorkflowOnUnreadEmails } from './domainEventHandlers/triggerWorkflowOnUnreadEmails.handler';

const useCases: Provider[] = [
  GetUnreadEmailsUseCase,
  TriggerEmailProcessingUseCase,
  GetEmailThreadMessagesUseCase,
];

const domainEventHandlers: Provider[] = [TriggerWorkflowOnUnreadEmails];

@Module({
  imports: [
    EmailWorkersInfrastructureModule,
    EmailWorkersDomainModule,
    EventPublishersModule,
  ],
  providers: [...useCases, ...domainEventHandlers],
  exports: [...useCases, ...domainEventHandlers],
})
export class EmailWorkersApplicationModule {}
