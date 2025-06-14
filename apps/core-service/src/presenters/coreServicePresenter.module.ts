import { Module } from '@nestjs/common';
import { CoreServiceController } from './http/core-service.controller';
import { HealthModule } from './http/health.module';

@Module({
  imports: [HealthModule],
  controllers: [CoreServiceController],
})
export class CoreServicePresenterModule {}
