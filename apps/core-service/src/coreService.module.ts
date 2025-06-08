import { Module } from '@nestjs/common';
import { AppConfigModule } from '@app-config/config';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreServiceApplicationModule } from './application/coreServiceApplication.module';
import { CoreServicePresenterModule } from './presenters/coreServicePresenter.module';
import { SchemaValidationModule } from '@schema-validation';

@Module({
  imports: [
    CqrsModule.forRoot(),
    AppConfigModule.forRoot(),
    CoreServicePresenterModule,
    CoreServiceApplicationModule,
    SchemaValidationModule,
  ],
})
export class CoreServiceModule {}
