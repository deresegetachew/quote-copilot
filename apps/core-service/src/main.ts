import { NestFactory } from '@nestjs/core';
import {
  AsyncMicroserviceOptions,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { TConfiguration } from '@app-config/config';
import { CoreServiceModule } from './coreService.module';

async function bootstrap() {
  // Create the HTTP (REST) app
  const app = await NestFactory.create(CoreServiceModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);

  const port = configService.getOrThrow<number>('apps.coreService.port');
  const name = configService.getOrThrow<string>('apps.coreService.name');
  const natsURL = configService.getOrThrow<string>('natsConfig.url');

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: natsURL,
      },
    },
    { inheritAppConfig: true },
  );

  app.startAllMicroservices().then(() => {
    console.log(`🚀 ${name} microservice is running 🚀`);
  });

  await app.listen(port, () => {
    console.log(`🥳 ${name} http server listening on port ${port} 🥳`);
  });
}
bootstrap();
