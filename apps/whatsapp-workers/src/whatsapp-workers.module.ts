import { Module } from '@nestjs/common';
import { WhatsappWorkersController } from './whatsapp-workers.controller';
import { WhatsappWorkersService } from './services/whatsapp-workers.service';
import { CommonHealthModule } from '@common/health';
import { HealthController } from './health.controller';

@Module({
  imports: [CommonHealthModule],
  controllers: [WhatsappWorkersController, HealthController],
  providers: [WhatsappWorkersService],
})
export class WhatsappWorkersModule {}
