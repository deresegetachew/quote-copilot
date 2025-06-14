import { Module } from '@nestjs/common';
import { EmailWorkersController } from './http/email-workers.controller';
import { HealthModule } from './http/health.module';

@Module({
  imports: [HealthModule],
  controllers: [EmailWorkersController],
})
export class EmailWorkersPresenterModule {}
