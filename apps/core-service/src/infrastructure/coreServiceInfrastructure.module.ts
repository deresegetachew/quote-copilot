import { Module } from '@nestjs/common';
import { MongooseAdapterModule } from './adapters/mongooseAdapter/mongooseAdapter.module';
import { DatabaseModule } from './database/mongo/database.module';

const adapterModules = [MongooseAdapterModule];

@Module({
  imports: [...adapterModules, DatabaseModule],
  controllers: [],
  providers: [],
  exports: [...adapterModules, DatabaseModule],
})
export class CoreServiceInfrastructureModule {}
