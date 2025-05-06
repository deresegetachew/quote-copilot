import { NestFactory } from '@nestjs/core';
import { EmailWorkersModule } from './email-workers.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(EmailWorkersModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('apps.emailWorker.port');
  const name = configService.getOrThrow<string>('apps.emailWorker.name');
  const natsURL = configService.getOrThrow<string>('natsConfig.url');

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: process.env.NATS_URL,
      },
    },
    { inheritAppConfig: true },
  );
  await app.startAllMicroservices();

  await app.listen(port, () => {
    console.log(`${name} service is running on port ${port}`);
  });
}
bootstrap();
