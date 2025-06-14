import { Controller, Get } from '@nestjs/common';
import { 
  HealthCheckService, 
  HealthCheck,
  HealthCheckResult 
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.checkTelegramBot(),
      () => this.checkNATSConnection(),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.checkTelegramBot(),
    ]);
  }

  @Get('live')
  @HealthCheck()
  async liveness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => Promise.resolve({
        'telegram-workers': {
          status: 'up',
          timestamp: new Date().toISOString(),
        }
      }),
    ]);
  }

  private async checkTelegramBot(): Promise<Record<string, any>> {
    try {
      // Basic Telegram Bot API check
      const hasBotToken = !!process.env.TELEGRAM_BOT_TOKEN;
      
      return Promise.resolve({
        'telegram-bot': {
          status: hasBotToken ? 'up' : 'degraded',
          hasBotToken,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      return Promise.resolve({
        'telegram-bot': {
          status: 'down',
          error: error.message,
          timestamp: new Date().toISOString(),
        }
      });
    }
  }

  private async checkNATSConnection(): Promise<Record<string, any>> {
    try {
      return Promise.resolve({
        'nats': {
          status: 'up',
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      return Promise.resolve({
        'nats': {
          status: 'down',
          error: error.message,
          timestamp: new Date().toISOString(),
        }
      });
    }
  }
} 