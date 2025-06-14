import { Module } from '@nestjs/common';
import { MongooseAdapterModule } from './adapters/mongooseAdapter/mongooseAdapter.module';
import { DatabaseModule } from './database/mongo/database.module';
import { EmailConfirmationAdapter } from './adapters/emailConfirmation.adapter';

const adapterModules = [MongooseAdapterModule];

@Module({
  imports: [...adapterModules, DatabaseModule],
  controllers: [],
  providers: [
    EmailConfirmationAdapter,
  ],
  exports: [
    ...adapterModules, 
    DatabaseModule,
    EmailConfirmationAdapter,
  ],
})
export class CoreServiceInfrastructureModule {}
