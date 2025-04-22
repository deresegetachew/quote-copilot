import { google } from 'googleapis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GmailAuth {
  private oAuth2Client: any;

  constructor(private readonly configService: ConfigService) {}

  async getOAuth2Client(): Promise<any> {
    if (this.oAuth2Client) return this.oAuth2Client;

    const clientId = this.configService.getOrThrow<string>(
      'gmailConfig.clientId',
    );
    const clientSecret = this.configService.getOrThrow<string>(
      'gmailConfig.clientSecret',
    );
    const redirectUri = this.configService.getOrThrow<string>(
      'gmailConfig.redirectUri',
    );

    const refreshToken = this.configService.getOrThrow<string>(
      'gmailConfig.refreshToken',
    );

    this.oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );

    this.oAuth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    // Ensure the access token is valid
    await this.oAuth2Client.getAccessToken();

    return this.oAuth2Client;
  }
}
