import { Module } from '@nestjs/common';
import { CoreServiceClient, EmailWorkersClient } from './http';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [CoreServiceClient, EmailWorkersClient],
  exports: [CoreServiceClient, EmailWorkersClient],
})
export class CommonClientsModule {}
