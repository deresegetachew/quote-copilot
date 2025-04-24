import { Module } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';

@Module({
  providers: [OrchestratorService],
})
export class AgentOrchestratorModule {}
