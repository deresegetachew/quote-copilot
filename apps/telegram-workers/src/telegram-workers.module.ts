import { Module } from '@nestjs/common';
import { TelegramWorkersController } from './telegram-workers.controller';
import { TelegramWorkersService } from './services/telegram-workers.service';

@Module({
  imports: [],
  controllers: [TelegramWorkersController],
  providers: [TelegramWorkersService],
})
export class TelegramWorkersModule {}
