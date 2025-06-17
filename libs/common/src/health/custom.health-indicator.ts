import { Injectable, Logger } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { connect, NatsConnection } from 'nats';
import { Connection, WorkflowService } from '@temporalio/client';
import { google } from 'googleapis';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class CustomHealthIndicator {
  private readonly logger = new Logger(CustomHealthIndicator.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly healthService: HealthIndicatorService,
    private readonly httpService: HttpService,
  ) {}

  async checkNATSConnection(key: string): Promise<HealthIndicatorResult> {
    let connection: NatsConnection | null = null;
    try {
      const natsUrl = this.configService.get<string>(
        'NATS_URL',
        'nats://localhost:4222',
      );

      if (!natsUrl) {
        return this.healthService.check(key).down({
          error: 'NATS_URL not configured',
          timestamp: new Date().toISOString(),
        });
      }

      // Attempt to connect to NATS with timeout
      const connectPromise = connect({
        servers: [natsUrl],
        timeout: 5000,
        reconnect: false,
      });

      connection = await Promise.race([
        connectPromise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 5000),
        ),
      ]);

      const serverInfo = connection.info;
      const isHealthy = connection.isClosed() === false;

      if (isHealthy) {
        return this.healthService.check(key).up({
          url: natsUrl,
          serverName: serverInfo?.server_name || 'unknown',
          version: serverInfo?.version || 'unknown',
          maxPayload: serverInfo?.max_payload || 0,
          timestamp: new Date().toISOString(),
        });
      } else {
        return this.healthService.check(key).down({
          url: natsUrl,
          error: 'Connection is closed',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error(
        `NATS health check failed: ${error.message}`,
        error.stack,
      );
      return this.healthService.check(key).down({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      // Clean up connection
      if (connection && !connection.isClosed()) {
        try {
          await connection.close();
        } catch (closeError) {
          this.logger.warn(
            `Failed to close NATS connection: ${closeError.message}`,
          );
        }
      }
    }
  }

  async checkGmailAPI(key: string): Promise<HealthIndicatorResult> {
    try {
      const clientId = this.configService.get<string>('gmailConfig.clientId');
      const clientSecret = this.configService.get<string>(
        'gmailConfig.clientSecret',
      );
      const refreshToken = this.configService.get<string>(
        'gmailConfig.refreshToken',
      );

      const hasCredentials = !!(clientId && clientSecret);
      const hasRefreshToken = !!refreshToken;

      if (!hasCredentials) {
        return this.healthService.check(key).down({
          hasClientCredentials: false,
          hasRefreshToken,
          error: 'Gmail OAuth credentials not configured',
          timestamp: new Date().toISOString(),
        });
      }

      try {
        // Create OAuth2 client and test the connection
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

        if (refreshToken) {
          oauth2Client.setCredentials({ refresh_token: refreshToken });

          // Test the connection by getting user profile
          const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
          const profile = await gmail.users.getProfile({ userId: 'me' });

          return this.healthService.check(key).up({
            hasClientCredentials: true,
            hasRefreshToken: true,
            emailAddress: profile.data.emailAddress,
            messagesTotal: profile.data.messagesTotal || 0,
            threadsTotal: profile.data.threadsTotal || 0,
            timestamp: new Date().toISOString(),
          });
        } else {
          // Credentials exist but no refresh token
          return this.healthService.check(key).up({
            hasClientCredentials: true,
            hasRefreshToken: false,
            warning: 'No refresh token configured - authentication required',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (authError) {
        return this.healthService.check(key).down({
          hasClientCredentials: hasCredentials,
          hasRefreshToken,
          error: `Gmail API authentication failed: ${authError.message}`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error(
        `Gmail API health check failed: ${error.message}`,
        error.stack,
      );
      return this.healthService.check(key).down({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async checkTelegramBot(key: string): Promise<HealthIndicatorResult> {
    try {
      const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

      if (!botToken) {
        return this.healthService.check(key).down({
          hasBotToken: false,
          error: 'TELEGRAM_BOT_TOKEN not configured',
          timestamp: new Date().toISOString(),
        });
      }

      try {
        // Test Telegram Bot API by calling getMe
        const response = await firstValueFrom(
          this.httpService
            .get(`https://api.telegram.org/bot${botToken}/getMe`)
            .pipe(timeout(5000)),
        );

        if (response.data.ok) {
          const botInfo = response.data.result;
          return this.healthService.check(key).up({
            hasBotToken: true,
            botId: botInfo.id,
            botUsername: botInfo.username,
            botFirstName: botInfo.first_name,
            canJoinGroups: botInfo.can_join_groups,
            canReadAllGroupMessages: botInfo.can_read_all_group_messages,
            supportsInlineQueries: botInfo.supports_inline_queries,
            timestamp: new Date().toISOString(),
          });
        } else {
          return this.healthService.check(key).down({
            hasBotToken: true,
            error: `Telegram API error: ${response.data.description}`,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (apiError) {
        return this.healthService.check(key).down({
          hasBotToken: true,
          error: `Failed to connect to Telegram API: ${apiError.message}`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error(
        `Telegram Bot health check failed: ${error.message}`,
        error.stack,
      );
      return this.healthService.check(key).down({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async checkTemporalConnection(key: string): Promise<HealthIndicatorResult> {
    let connection: Connection | null = null;
    try {
      const temporalHost = this.configService.get<string>(
        'TEMPORAL_HOST',
        'localhost',
      );
      const temporalPort = this.configService.get<string>(
        'TEMPORAL_PORT',
        '7233',
      );
      const temporalNamespace = this.configService.get<string>(
        'TEMPORAL_NAMESPACE',
        'default',
      );

      if (!temporalHost || !temporalPort) {
        return this.healthService.check(key).down({
          host: temporalHost || 'not configured',
          port: temporalPort || 'not configured',
          error: 'Temporal connection details not configured',
          timestamp: new Date().toISOString(),
        });
      }

      try {
        // Create connection to Temporal
        connection = await Connection.connect({
          address: `${temporalHost}:${temporalPort}`,
          connectTimeout: '5s',
        });

        // Test connection by creating a workflow service and getting system info
        const workflowService = connection.workflowService;
        const systemInfo = await workflowService.getSystemInfo({});

        return this.healthService.check(key).up({
          host: temporalHost,
          port: temporalPort,
          namespace: temporalNamespace,
          serverVersion: systemInfo.serverVersion || 'unknown',
          capabilities: systemInfo.capabilities || {},
          timestamp: new Date().toISOString(),
        });
      } catch (connectionError) {
        return this.healthService.check(key).down({
          host: temporalHost,
          port: temporalPort,
          namespace: temporalNamespace,
          error: `Failed to connect to Temporal: ${connectionError.message}`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error(
        `Temporal health check failed: ${error.message}`,
        error.stack,
      );
      return this.healthService.check(key).down({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      // Clean up connection
      if (connection) {
        try {
          connection.close();
        } catch (closeError) {
          this.logger.warn(
            `Failed to close Temporal connection: ${closeError.message}`,
          );
        }
      }
    }
  }

  async checkWhatsAppAPI(key: string): Promise<HealthIndicatorResult> {
    try {
      const apiKey = this.configService.get<string>('WHATSAPP_API_KEY');
      const webhookUrl = this.configService.get<string>('WHATSAPP_WEBHOOK_URL');
      const apiUrl = this.configService.get<string>(
        'WHATSAPP_API_URL',
        'https://graph.facebook.com/v17.0',
      );
      const phoneNumberId = this.configService.get<string>(
        'WHATSAPP_PHONE_NUMBER_ID',
      );

      const hasApiKey = !!apiKey;
      const hasWebhookUrl = !!webhookUrl;
      const hasPhoneNumberId = !!phoneNumberId;

      if (!hasApiKey) {
        return this.healthService.check(key).down({
          hasApiKey: false,
          hasWebhookUrl,
          hasPhoneNumberId,
          error: 'WHATSAPP_API_KEY not configured',
          timestamp: new Date().toISOString(),
        });
      }

      if (!hasPhoneNumberId) {
        return this.healthService.check(key).down({
          hasApiKey: true,
          hasWebhookUrl,
          hasPhoneNumberId: false,
          error: 'WHATSAPP_PHONE_NUMBER_ID not configured',
          timestamp: new Date().toISOString(),
        });
      }

      try {
        // Test WhatsApp Business API by getting phone number info
        const response = await firstValueFrom(
          this.httpService
            .get(`${apiUrl}/${phoneNumberId}`, {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
            })
            .pipe(timeout(5000)),
        );

        if (response.status === 200 && response.data) {
          return this.healthService.check(key).up({
            hasApiKey: true,
            hasWebhookUrl,
            hasPhoneNumberId: true,
            phoneNumber: response.data.display_phone_number,
            verifiedName: response.data.verified_name,
            codeVerificationStatus: response.data.code_verification_status,
            qualityRating: response.data.quality_rating,
            timestamp: new Date().toISOString(),
          });
        } else {
          return this.healthService.check(key).down({
            hasApiKey: true,
            hasWebhookUrl,
            hasPhoneNumberId: true,
            error: 'Invalid response from WhatsApp API',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (apiError) {
        let errorMessage = 'Failed to connect to WhatsApp API';
        if (apiError.response?.status === 401) {
          errorMessage = 'WhatsApp API authentication failed - invalid API key';
        } else if (apiError.response?.status === 404) {
          errorMessage = 'WhatsApp phone number ID not found';
        } else if (apiError.response?.data?.error) {
          errorMessage = `WhatsApp API error: ${apiError.response.data.error.message}`;
        } else {
          errorMessage = `WhatsApp API error: ${apiError.message}`;
        }

        return this.healthService.check(key).down({
          hasApiKey: true,
          hasWebhookUrl,
          hasPhoneNumberId: true,
          error: errorMessage,
          statusCode: apiError.response?.status,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error(
        `WhatsApp API health check failed: ${error.message}`,
        error.stack,
      );
      return this.healthService.check(key).down({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
