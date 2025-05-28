import { Module } from '@nestjs/common';
import { CoreServiceController } from './http/core-service.controller';

@Module({
  controllers: [CoreServiceController],
})
export class CoreServicePresenterModule {}
