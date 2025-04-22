import { Controller, Get } from '@nestjs/common';
import { TelegramWorkersService } from './services/telegram-workers.service';

@Controller()
export class TelegramWorkersController {
  constructor(
    private readonly telegramWorkersService: TelegramWorkersService,
  ) {}

  @Get()
  getHello(): string {
    return this.telegramWorkersService.getHello();
  }
}
