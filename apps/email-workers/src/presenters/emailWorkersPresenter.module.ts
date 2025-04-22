import { Module } from '@nestjs/common';
import { EmailWorkersController } from './http/email-workers.controller';

@Module({
  controllers: [EmailWorkersController],
})
export class EmailWorkersPresenterModule {}
