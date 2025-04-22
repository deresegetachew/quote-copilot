import { Controller, Get } from '@nestjs/common';
import { WhatsappWorkersService } from './services/whatsapp-workers.service';

@Controller()
export class WhatsappWorkersController {
  constructor(
    private readonly whatsappWorkersService: WhatsappWorkersService,
  ) {}

  @Get()
  getHello(): string {
    return this.whatsappWorkersService.getHello();
  }
}
