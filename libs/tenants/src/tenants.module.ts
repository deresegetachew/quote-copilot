import { Module } from '@nestjs/common';
import { TenantsService } from './services/tenants.service';

@Module({
  providers: [],
  exports: [TenantsService],
})
export class TenantsModule {}
