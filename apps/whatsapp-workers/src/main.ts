import { NestFactory } from '@nestjs/core';
import { WhatsappWorkersModule } from './whatsapp-workers.module';

async function bootstrap() {
  const app = await NestFactory.create(WhatsappWorkersModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
