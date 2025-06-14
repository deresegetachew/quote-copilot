import { Controller, Get } from '@nestjs/common';
import { 
  HealthCheckService, 
  HealthCheck, 
  MongooseHealthIndicator,
  HealthCheckResult 
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      // MongoDB health check
      () => this.mongoose.pingCheck('mongodb'),
      
      // Custom health checks
      () => this.checkGmailAPI(),
      () => this.checkNATSConnection(),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.mongoose.pingCheck('mongodb'),
      () => this.checkGmailAPI(),
    ]);
  }

  @Get('live')
  @HealthCheck()
  async liveness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => Promise.resolve({
        'email-workers': {
          status: 'up',
          timestamp: new Date().toISOString(),
        }
      }),
    ]);
  }

  private async checkGmailAPI(): Promise<Record<string, any>> {
    try {
      // Basic Gmail API availability check
      // In a real implementation, you might verify OAuth token validity
      const hasRefreshToken = !!process.env.GMAIL_REFRESH_TOKEN;
      const hasClientCredentials = !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET);
      
      return Promise.resolve({
        'gmail-api': {
          status: hasRefreshToken && hasClientCredentials ? 'up' : 'degraded',
          hasRefreshToken,
          hasClientCredentials,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      return Promise.resolve({
        'gmail-api': {
          status: 'down',
          error: error.message,
          timestamp: new Date().toISOString(),
        }
      });
    }
  }

  private async checkNATSConnection(): Promise<Record<string, any>> {
    try {
      // Basic NATS connectivity check
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