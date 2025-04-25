import { Module, Provider } from '@nestjs/common';
import { EmailWorkersDomainModule } from '../domain/emailWorkersDomain.module';
import { EmailWorkersInfrastructureModule } from '../infrastructure/emailWorkersInfrastructure.module';
import { GetUnreadEmailsUseCase } from './useCases/emailUseCases/getUnreadEmails.useCase';
import { TriggerEmailProcessingUseCase } from './useCases/wfUseCases/triggerEmailProcessing.useCase';
import { GetEmailThreadMessagesUseCase } from './useCases/emailUseCases/getEmailThreadMessages.useCase';

const useCases: Provider[] = [
  GetUnreadEmailsUseCase,
  TriggerEmailProcessingUseCase,
  GetEmailThreadMessagesUseCase,
];

@Module({
  imports: [EmailWorkersInfrastructureModule, EmailWorkersDomainModule],
  providers: [...useCases],
  exports: [...useCases],
})
export class EmailWorkersApplicationModule {}
