import { Module } from '@nestjs/common';
import { TerminusModule, HealthIndicatorService } from '@nestjs/terminus';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { CustomHealthIndicator } from './custom.health-indicator';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    MongooseModule.forFeature([]), // Required for MongooseHealthIndicator
  ],
  providers: [CustomHealthIndicator, HealthIndicatorService],
  exports: [CustomHealthIndicator, TerminusModule, HealthIndicatorService],
})
export class CommonHealthModule {}
