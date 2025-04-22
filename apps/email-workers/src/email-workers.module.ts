import { Module } from '@nestjs/common';
import { EmailWorkersPresenterModule } from './presenters/emailWorkersPresenter.module';
import { EmailWorkersApplicationModule } from './application/emailWorkersApplication.module';
import { AppConfigModule } from '@app-config/config';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule.forRoot(),
    AppConfigModule.forRoot(),
    EmailWorkersPresenterModule,
    EmailWorkersApplicationModule,
  ],
})
export class EmailWorkersModule {}
