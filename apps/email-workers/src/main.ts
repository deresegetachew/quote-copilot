import { NestFactory } from '@nestjs/core';
import { EmailWorkersModule } from './email-workers.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(EmailWorkersModule);
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('apps.emailWorker.port');
  const name = configService.getOrThrow<string>('apps.emailWorker.name');

  await app.listen(port, () => {
    console.log(`${name} service is running on port ${port}`);
  });
}
bootstrap();
