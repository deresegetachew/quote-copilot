import { NestFactory } from '@nestjs/core';
import { DocumentWorkerModule } from './documentWorker.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(DocumentWorkerModule);

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('apps.documentWorker.port');
  const name = configService.getOrThrow<string>('apps.documentWorker.name');
  const natsURL = configService.getOrThrow<string>('natsConfig.url');

  // listening to NATS microservice
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: natsURL,
      },
    },
    { inheritAppConfig: true },
  );
  await app.startAllMicroservices().then(() => {
    console.log(`🚀 ${name} microservice is running 🚀`);
    console.log(`NATS server URL: ${natsURL}`);
  });

  await app.listen(port, () => {
    console.log(` ${name} http server is listening on port ${port}`);
  });
}
bootstrap();
