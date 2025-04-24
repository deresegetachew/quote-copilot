import { Module } from '@nestjs/common';
import { EmailClientAdapterModule } from './adapters/emailClientAdapter/emailClientAdapter.module';
import { MongooseAdapterModule } from './adapters/mongooseAdapter/mongooseAdapter.module';
import { DatabaseModule } from './database/mongo/database.module';
import { TemporalWorkFlowAdapterModule } from './adapters/temporalWorkFlowAdapter/temporalWorkFlowAdapter.module';

const adapterModules = [
  EmailClientAdapterModule,
  MongooseAdapterModule,
  TemporalWorkFlowAdapterModule,
];

@Module({
  imports: [...adapterModules, DatabaseModule],
  controllers: [],
  providers: [],
  exports: [...adapterModules, DatabaseModule],
})
export class EmailWorkersInfrastructureModule {}
