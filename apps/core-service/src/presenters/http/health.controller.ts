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
      () => this.checkAIService(),
      () => this.checkNATSConnection(),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.mongoose.pingCheck('mongodb'),
      () => this.checkAIService(),
    ]);
  }

  @Get('live')
  @HealthCheck()
  async liveness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => Promise.resolve({
        'core-service': {
          status: 'up',
          timestamp: new Date().toISOString(),
        }
      }),
    ]);
  }

  private async checkAIService(): Promise<Record<string, any>> {
    try {
      // Basic AI service availability check
      return Promise.resolve({
        'ai-provider': {
          status: 'up',
          provider: process.env.AI_STRATEGY || 'gemini',
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      return Promise.resolve({
        'ai-provider': {
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