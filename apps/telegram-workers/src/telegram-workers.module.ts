import { Module } from '@nestjs/common';
import { TelegramWorkersController } from './telegram-workers.controller';
import { TelegramWorkersService } from './services/telegram-workers.service';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [TelegramWorkersController, HealthController],
  providers: [TelegramWorkersService],
})
export class TelegramWorkersModule {}
