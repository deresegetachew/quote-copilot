import { Module } from '@nestjs/common';
import { EmailClientAdapterModule } from './adapters/emailClientAdapter/emailClientAdapter.module';
import { MongooseAdapterModule } from './adapters/mongooseAdapter/mongooseAdapter.module';
import { DatabaseModule } from './database/mongo/database.module';
import { TemporalWorkFlowAdapterModule } from './adapters/temporalWorkFlowAdapter/temporalWorkFlowAdapter.module';
import { EmailTemplateRendererService } from './services';

const adapterModules = [
  EmailClientAdapterModule,
  MongooseAdapterModule,
  TemporalWorkFlowAdapterModule,
];

@Module({
  imports: [...adapterModules, DatabaseModule],
  controllers: [],
  providers: [
    EmailTemplateRendererService,
  ],
  exports: [
    ...adapterModules, 
    DatabaseModule,
    EmailTemplateRendererService,
  ],
})
export class EmailWorkersInfrastructureModule {}
