import { NestFactory } from '@nestjs/core';
import { AgentOrchestratorModule } from './agentOrchestrator.module';
import { OrchestratorService } from './orchestrator.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(
    AgentOrchestratorModule,
  );

  const service = app.get(OrchestratorService);
  await service.startWorker();
}

bootstrap();
