import { Module } from '@nestjs/common';
import { GenerateTokenCommand } from './generate-token.command';
import { AppConfigModule } from '../../../../libs/config/src/config.module';

@Module({
  imports: [AppConfigModule],
  providers: [GenerateTokenCommand],
})
export class GmailOAuthModule {}
