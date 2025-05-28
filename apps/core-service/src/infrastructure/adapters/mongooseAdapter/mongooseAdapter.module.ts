import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RFQ, RFQSchema } from '../../database/mongo/schemas/rfq.schema';
import { RfqRepositoryPort } from '../../../application/ports/outgoing/rfqRepository.port';
import { RFQRepositoryAdapter } from './rfqRepository.adapter';

@Module({
  imports: [MongooseModule.forFeature([{ name: RFQ.name, schema: RFQSchema }])],
  providers: [
    RFQRepositoryAdapter,
    {
      provide: RfqRepositoryPort,
      useClass: RFQRepositoryAdapter,
    },
  ],
  exports: [RfqRepositoryPort],
})
export class MongooseAdapterModule {}
