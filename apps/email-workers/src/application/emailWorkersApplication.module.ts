import { Module, Provider } from '@nestjs/common';
import { EmailWorkersDomainModule } from '../domain/emailWorkersDomain.module';
import { EmailWorkersInfrastructureModule } from '../infrastructure/emailWorkersInfrastructure.module';
import { GetUnreadEmailsUseCase } from './useCases/emailUseCases/getUnreadEmails.useCase';
import { TriggerEmailProcessingUseCase } from './useCases/wfUseCases/triggerEmailProcessing.useCase';
import { GetEmailThreadMessagesUseCase } from './useCases/emailUseCases/getEmailThreadMessages.useCase';
import { SendEmailUseCase } from './useCases/emailUseCases/sendEmail.useCase';
import { SendReplyUseCase } from './useCases/emailUseCases/sendReply.useCase';
import { SendRfqConfirmationEmailUseCase } from './useCases/emailUseCases/sendRFQConfirmationEmai.useCase';
import { RfqConfirmationEmailRequestedHandler } from './integrationEventHandlers/rfqConfirmationEmailRequested.handler';

const useCases: Provider[] = [
  GetUnreadEmailsUseCase,
  TriggerEmailProcessingUseCase,
  GetEmailThreadMessagesUseCase,
  SendEmailUseCase,
  SendReplyUseCase,
  SendRfqConfirmationEmailUseCase,
];

const integrationEventHandlers = [
  RfqConfirmationEmailRequestedHandler,
];

@Module({
  imports: [EmailWorkersInfrastructureModule, EmailWorkersDomainModule],
  controllers: [...integrationEventHandlers],
  providers: [...useCases],
  exports: [...useCases],
})
export class EmailWorkersApplicationModule {}
