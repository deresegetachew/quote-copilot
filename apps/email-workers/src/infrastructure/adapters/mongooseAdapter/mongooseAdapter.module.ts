import { Module } from '@nestjs/common';
import { EmailMessageRepositoryAdapter } from './emailMessageRepository.adapter';
import { EmailMessageRepositoryPort } from '../../../application/ports/outgoing/emailMessageRepository.port';
import { DatabaseModule } from '../../database/mongo/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    EmailMessageRepositoryAdapter,
    {
      provide: EmailMessageRepositoryPort,
      useClass: EmailMessageRepositoryAdapter,
    },
  ],
  exports: [EmailMessageRepositoryPort],
})
export class MongooseAdapterModule {}
