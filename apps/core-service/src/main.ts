import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TConfiguration } from '@app-config/config';
import { CoreServiceModule } from './coreService.module';

async function bootstrap() {
  // Create the HTTP (REST) app
  const httpApp = await NestFactory.create(CoreServiceModule);
  
  const configService = httpApp.get(ConfigService);

  // Get CORS configuration from config
  const corsConfig = configService.getOrThrow<TConfiguration['corsConfig']>('corsConfig');
  
  // Enable CORS using configuration
  httpApp.enableCors({
    origin: corsConfig.origins,
    methods: corsConfig.methods,
    allowedHeaders: corsConfig.allowedHeaders,
    credentials: corsConfig.credentials,
  });

  httpApp.useGlobalPipes(new ValidationPipe({ 
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false,
  }));
  
  httpApp.enableShutdownHooks();

  const port = configService.getOrThrow<number>('apps.coreService.port');
  const name = configService.getOrThrow<string>('apps.coreService.name');
  const natsURL = configService.getOrThrow<string>('natsConfig.url');

  await httpApp.listen(port, () => {
    console.log(`${name} HTTP server is listening on port ${port}`);
    console.log(`Health endpoint: http://localhost:${port}/health`);
    console.log(`API endpoints: http://localhost:${port}/core-service/*`);
  });

  // Create the microservice (NATS)
  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(
    CoreServiceModule,
    {
      transport: Transport.NATS,
      options: {
        servers: [natsURL],
      },
    },
  );

  // Uncomment below to enable NATS microservice
  // await microservice.listen().catch((err) => {
  //   console.error('Error starting core-service microservice: ', err);
  //   process.exit(1);
  // });
  // console.log('core-service Microservice is listening with NATS');
}
bootstrap();
