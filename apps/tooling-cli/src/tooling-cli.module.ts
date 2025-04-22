import { Module } from '@nestjs/common';
import { GmailOAuthModule } from './gmailOAuth/gmailOAuth.module';
import { AppConfigModule } from '../../../libs/config/src/config.module';

@Module({
  imports: [AppConfigModule.forRoot(), GmailOAuthModule],
})
export class ToolingCliModule {}
