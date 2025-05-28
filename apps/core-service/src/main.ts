import { NestFactory } from '@nestjs/core';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { TConfiguration } from '@app-config/config';
import { CoreServiceModule } from './coreService.module';

async function bootstrap() {
  // Create the HTTP (REST) app
  const httpApp = await NestFactory.create(CoreServiceModule);
  httpApp.useGlobalPipes(new ValidationPipe({ transform: true }));
  httpApp.enableShutdownHooks();

  const configService = httpApp.get(ConfigService);

  const port = configService.getOrThrow<number>('apps.coreService.port');
  const name = configService.getOrThrow<string>('apps.coreService.name');

  await httpApp.listen(port, () => {
    console.log(`🥳 ${name} HTTP server is listening on port ${port} 🥳`);
  });

  // Create the microservice (NATS)
  const microservice =
    await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
      CoreServiceModule,
      {
        useFactory: (configService: ConfigService) => ({
          transport: Transport.NATS,
          options: {
            servers:
              configService.getOrThrow<TConfiguration['natsConfig']>(
                'natsConfig',
              ).url,
          },
        }),
        inject: [ConfigService],
      },
    );
  microservice.enableShutdownHooks();

  // await microservice.listen().catch((err) => {
  //   console.error('🚨 Error starting core-service microservice 🚨: ', err);
  //   process.exit(1);
  // });
  // console.log('🥳 core-service Microservice is listening with NATS 🥳');
}
bootstrap();
