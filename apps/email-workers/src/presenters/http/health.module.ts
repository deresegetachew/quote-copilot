import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TerminusModule,
    MongooseModule.forFeature([]), // Required for MongooseHealthIndicator
  ],
  controllers: [HealthController],
})
export class HealthModule {} 