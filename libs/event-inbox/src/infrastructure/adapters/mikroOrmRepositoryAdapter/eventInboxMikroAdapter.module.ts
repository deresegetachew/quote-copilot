import { Module } from '@nestjs/common';
import { EventInboxMikroOrmRepositoryAdapter } from './eventInboxMikroRepository.adapter';
import { EventInboxRepositoryPort } from '../../../application/ports/eventInboxRepository.port';

@Module({
  imports: [EventInboxMikroOrmRepositoryAdapter],
  providers: [
    {
      provide: EventInboxRepositoryPort,
      useClass: EventInboxMikroOrmRepositoryAdapter,
    },
  ],
  exports: [EventInboxRepositoryPort],
})
export class EventInboxMikroAdapterModule {}
