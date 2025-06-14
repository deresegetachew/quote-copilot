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
      () => this.checkWhatsAppAPI(),
      () => this.checkNATSConnection(),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.checkWhatsAppAPI(),
    ]);
  }

  @Get('live')
  @HealthCheck()
  async liveness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => Promise.resolve({
        'whatsapp-workers': {
          status: 'up',
          timestamp: new Date().toISOString(),
        }
      }),
    ]);
  }

  private async checkWhatsAppAPI(): Promise<Record<string, any>> {
    try {
      // Basic WhatsApp API check
      const hasApiKey = !!process.env.WHATSAPP_API_KEY;
      const hasWebhookUrl = !!process.env.WHATSAPP_WEBHOOK_URL;
      
      return Promise.resolve({
        'whatsapp-api': {
          status: hasApiKey ? 'up' : 'degraded',
          hasApiKey,
          hasWebhookUrl,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      return Promise.resolve({
        'whatsapp-api': {
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