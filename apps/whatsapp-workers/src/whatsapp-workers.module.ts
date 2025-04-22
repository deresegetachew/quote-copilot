import { Module } from '@nestjs/common';
import { WhatsappWorkersController } from './whatsapp-workers.controller';
import { WhatsappWorkersService } from './services/whatsapp-workers.service';

@Module({
  imports: [],
  controllers: [WhatsappWorkersController],
  providers: [WhatsappWorkersService],
})
export class WhatsappWorkersModule {}
