import { Module } from '@nestjs/common';
import { DocumentWorkerPresenterModule } from './presenters/documentWorkersPresenter.module';
import { DocumentWorkerApplicationModule } from './application/documentWorkerApplication.module';
import { AppConfigModule, TConfiguration } from '@app-config/config';
import { CqrsModule } from '@nestjs/cqrs';
import { SchemaValidationModule } from '../../../libs/schema-validation/src';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { INTEGRATION_EVENT_CLIENT } from '../../../libs/common/src';

@Module({
  imports: [
    CqrsModule.forRoot(),
    AppConfigModule.forRoot(),
    DocumentWorkerPresenterModule,
    DocumentWorkerApplicationModule,
    SchemaValidationModule,
    // nats client for sending messages
    ClientsModule.registerAsync([
      {
        name: INTEGRATION_EVENT_CLIENT,
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
  ],
})
export class DocumentWorkerModule {}
