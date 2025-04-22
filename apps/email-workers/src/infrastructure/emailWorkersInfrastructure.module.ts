import { Module } from '@nestjs/common';
import { EmailClientAdapterModule } from './adapters/emailClientAdapter/emailClientAdapter.module';
import { MongooseAdapterModule } from './adapters/mongooseAdapter/mongooseAdapter.module';
import { DatabaseModule } from './database/mongo/database.module';

const adapterModules = [EmailClientAdapterModule, MongooseAdapterModule];

@Module({
  imports: [...adapterModules, DatabaseModule],
  controllers: [],
  providers: [],
  exports: [...adapterModules, DatabaseModule],
})
export class EmailWorkersInfrastructureModule {}
