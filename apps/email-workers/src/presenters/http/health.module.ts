import { Module } from '@nestjs/common';
import { CommonHealthModule } from '@common/health';
import { HealthController } from './health.controller';

@Module({
  imports: [CommonHealthModule],
  controllers: [HealthController],
})
export class HealthModule {}
