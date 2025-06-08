import { Module } from '@nestjs/common';
import { DocumentWorkerPresenterModule } from './presenters/documentWorkersPresenter.module';
import { DocumentWorkerApplicationModule } from './application/documentWorkerApplication.module';
import { AppConfigModule } from '@app-config/config';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule.forRoot(),
    AppConfigModule.forRoot(),
    DocumentWorkerPresenterModule,
    DocumentWorkerApplicationModule,
  ],
})
export class DocumentWorkerModule {}
