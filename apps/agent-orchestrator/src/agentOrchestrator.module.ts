import { Module } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { AppConfigModule } from '@app-config/config';
import { HttpModule } from '@nestjs/axios';
import { PromptsModule } from '@prompts';
import { LangChainModule } from '@tools-langchain';
@Module({
  imports: [
    AppConfigModule.forRoot(),
    HttpModule,
    PromptsModule,
    LangChainModule,
  ],
  providers: [OrchestratorService],
})
export class AgentOrchestratorModule {}
