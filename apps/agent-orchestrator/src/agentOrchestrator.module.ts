import { Module } from '@nestjs/common';
import { OrchestratorService } from './orchestrator.service';
import { AppConfigModule, TConfiguration } from '@app-config/config';
import { HttpModule } from '@nestjs/axios';
import { PromptsModule } from '@prompts';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_SERVICE } from '@common';
import { ConfigService } from '@nestjs/config';
import { CommonClientsModule } from '@common/clients/commonClients.module';

@Module({
  imports: [
    AppConfigModule.forRoot(),
    HttpModule,
    PromptsModule,
    ClientsModule.registerAsync([
      {
        name: NATS_SERVICE,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.NATS,
          options: {
            servers:
              configService.getOrThrow<TConfiguration['natsConfig']>(
                'natsConfig',
              ).url,
          },
        }),
      },
    ]),
    CommonClientsModule,
  ],
  providers: [OrchestratorService],
})
export class AgentOrchestratorModule {}
