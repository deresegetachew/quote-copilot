import { NestFactory } from '@nestjs/core';
import { AppModule } from './application/application.module';
import {
  AsyncMicroserviceOptions,
  MicroserviceOptions,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { TConfiguration } from '@app-config/config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    AppModule,
    {
      useFactory: (configService: ConfigService) => ({
        transport: Transport.NATS,
        options: {
          servers:
            configService.getOrThrow<TConfiguration['natsConfig']>('natsConfig')
              .url,
        },
      }),
      inject: [ConfigService],
    },
  );
  app.enableShutdownHooks();

  await app.listen().catch((err) => {
    console.error('🚨 Error starting core-service microservice 🚨: ', err);
    process.exit(1);
  });

  console.log('🥳 core-service Microservice is listening with NATS 🥳');
}
bootstrap();
