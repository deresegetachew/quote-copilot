import { Module } from '@nestjs/common';
import { AppConfigModule, TConfiguration } from '@app-config/config';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreServiceApplicationModule } from './application/coreServiceApplication.module';
import { CoreServicePresenterModule } from './presenters/coreServicePresenter.module';
import { SchemaValidationModule } from '@schema-validation';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { INTEGRATION_EVENT_CLIENT } from '../../../libs/common/src';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CqrsModule.forRoot(),
    AppConfigModule.forRoot(),
    CoreServicePresenterModule,
    CoreServiceApplicationModule,
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
export class CoreServiceModule {}
