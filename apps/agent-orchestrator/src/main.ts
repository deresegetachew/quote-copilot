import { OrchestratorService } from './orchestrator.service';
import { setAppContext } from './getAppContext';
import { NestFactory } from '@nestjs/core';
import { AgentOrchestratorModule } from './agentOrchestrator.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(
    AgentOrchestratorModule,
  );
  setAppContext(app);

  const service = app.get(OrchestratorService);
  await service.startWorker();
}

bootstrap();
