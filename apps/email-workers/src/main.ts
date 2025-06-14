import { NestFactory } from '@nestjs/core';
import { EmailWorkersModule } from './email-workers.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TConfiguration } from '@app-config/config';

async function bootstrap() {
  const app = await NestFactory.create(EmailWorkersModule);

  const configService = app.get(ConfigService);

  // Get CORS configuration from config
  const corsConfig = configService.getOrThrow<TConfiguration['corsConfig']>('corsConfig');
  
  // Enable CORS using configuration
  app.enableCors({
    origin: corsConfig.origins,
    methods: corsConfig.methods,
    allowedHeaders: corsConfig.allowedHeaders,
    credentials: corsConfig.credentials,
  });

  app.useGlobalPipes(new ValidationPipe({ 
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false,
  }));
  
  app.enableShutdownHooks();

  const port = configService.getOrThrow<number>('apps.emailWorker.port');
  const name = configService.getOrThrow<string>('apps.emailWorker.name');
  const natsURL = configService.getOrThrow<string>('natsConfig.url');

  // Enable NATS microservice for event listening
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: natsURL,
      },
    },
    { inheritAppConfig: true },
  );
  await app.startAllMicroservices();

  await app.listen(port, () => {
    console.log(`${name} HTTP server is listening on port ${port}`);
    console.log(`Email sending API: http://localhost:${port}/email-workers/send-email`);
    console.log(`Reply API: http://localhost:${port}/email-workers/send-reply`);
    console.log(`NATS microservice connected for event listening`);
  });
}
bootstrap();
