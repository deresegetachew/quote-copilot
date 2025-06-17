import { Module } from '@nestjs/common';
import { TelegramWorkersController } from './telegram-workers.controller';
import { TelegramWorkersService } from './services/telegram-workers.service';
import { CommonHealthModule } from '@common/health';
import { HealthController } from './health.controller';

@Module({
  imports: [CommonHealthModule],
  controllers: [TelegramWorkersController, HealthController],
  providers: [TelegramWorkersService],
})
export class TelegramWorkersModule {}
