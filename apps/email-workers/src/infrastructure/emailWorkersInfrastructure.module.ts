import { Module } from '@nestjs/common';
import { EmailClientAdapterModule } from './adapters/emailClientAdapter/emailClientAdapter.module';

const modules = [EmailClientAdapterModule];

@Module({
  imports: [...modules],
  controllers: [],
  providers: [],
  exports: [EmailClientAdapterModule],
})
export class EmailWorkersInfrastructureModule {}
