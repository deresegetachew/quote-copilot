import { Module } from '@nestjs/common';
import { WhatsappWorkersController } from './whatsapp-workers.controller';
import { WhatsappWorkersService } from './services/whatsapp-workers.service';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [WhatsappWorkersController, HealthController],
  providers: [WhatsappWorkersService],
})
export class WhatsappWorkersModule {}
