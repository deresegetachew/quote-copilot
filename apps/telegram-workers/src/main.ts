import { NestFactory } from '@nestjs/core';
import { TelegramWorkersModule } from './telegram-workers.module';

async function bootstrap() {
  const app = await NestFactory.create(TelegramWorkersModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
