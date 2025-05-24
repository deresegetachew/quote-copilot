import { OrchestratorService } from './orchestrator.service';
import { AppContext } from './appContext';
import { NestApplication, NestFactory } from '@nestjs/core';
import { AgentOrchestratorModule } from './agentOrchestrator.module';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { TConfiguration } from '@app-config/config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    AgentOrchestratorModule,
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

  AppContext.set(app);

  const service = app.get(OrchestratorService);
  await service.startWorker();
}

bootstrap();
