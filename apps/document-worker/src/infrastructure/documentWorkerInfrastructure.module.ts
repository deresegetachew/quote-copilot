import { Module } from '@nestjs/common';
import { MongooseAdapterModule } from './adapters/mongooseAdapter/mongooseAdapter.module';
import { DatabaseModule } from './database/mongo/database.module';
import { DocParserClientAdapterModule } from './adapters/docParserClientAdapters/docParserClientAdapter.module';

const adapterModules = [MongooseAdapterModule, DocParserClientAdapterModule];

@Module({
  imports: [...adapterModules, DatabaseModule],
  controllers: [],
  providers: [],
  exports: [...adapterModules, DatabaseModule],
})
export class DocumentWorkerInfrastructureModule {}
