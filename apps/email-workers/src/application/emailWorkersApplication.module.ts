import { Module, Provider } from '@nestjs/common';
import { EmailWorkersDomainModule } from '../domain/emailWorkersDomain.module';
import { EmailWorkersInfrastructureModule } from '../infrastructure/emailWorkersInfrastructure.module';
import { GetUnreadEmailsUseCase } from './useCases/emailUseCases/getUnreadEmails.useCase';
import { TriggerEmailProcessingUseCase } from './useCases/wfUseCases/triggerEmailProcessing.useCase';

const useCases: Provider[] = [
  GetUnreadEmailsUseCase,
  TriggerEmailProcessingUseCase,
];

@Module({
  imports: [EmailWorkersInfrastructureModule, EmailWorkersDomainModule],
  providers: [...useCases],
  exports: [...useCases],
})
export class EmailWorkersApplicationModule {}
