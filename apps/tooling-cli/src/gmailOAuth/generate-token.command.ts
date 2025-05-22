import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as readline from 'readline';
import { ConfigService } from '@nestjs/config';

@Injectable()
@Command({ name: 'generate-token', description: 'Generate Gmail OAuth2 token' })
export class GenerateTokenCommand extends CommandRunner {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async run(): Promise<void> {
    const clientId = this.configService.getOrThrow<string>(
      'gmailConfig.clientId',
    );
    const clientSecret = this.configService.getOrThrow<string>(
      'gmailConfig.clientSecret',
    );
    const redirectUri = this.configService.getOrThrow<string>(
      'gmailConfig.redirectUri',
    );

    const scope = this.configService.getOrThrow<string[]>('gmailConfig.scopes');

    const oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scope,
      prompt: 'consent',
    });

    console.log('\n🔐 Visit this URL in your browser to authorize access:');
    console.log(authUrl);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('\n📥 Paste the code from the browser here: ', async (code) => {
      rl.close();
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      console.log('\n✅ OAuth tokens:');
      console.log(JSON.stringify(tokens, null, 2));
    });
  }
}
