import { Module, Provider } from '@nestjs/common';
import { GetUnreadEmailsUseCase } from './useCases/getUnreadEmails.useCase';
import { EmailWorkersDomainModule } from '../domain/emailWorkersDomain.module';
import { EmailWorkersInfrastructureModule } from '../infrastructure/emailWorkersInfrastructure.module';

const useCases: Provider[] = [GetUnreadEmailsUseCase];

@Module({
  imports: [EmailWorkersInfrastructureModule, EmailWorkersDomainModule],
  providers: [...useCases],
  exports: [...useCases],
})
export class EmailWorkersApplicationModule {}
