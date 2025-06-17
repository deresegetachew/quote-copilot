import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MongooseHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { CustomHealthIndicator } from '@common/health';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly customHealth: CustomHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      // MongoDB health check
      () => this.mongoose.pingCheck('mongodb'),

      // Custom health checks
      () => this.customHealth.checkGmailAPI('gmail-api'),
      () => this.customHealth.checkNATSConnection('nats'),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.mongoose.pingCheck('mongodb'),
      () => this.customHealth.checkGmailAPI('gmail-api'),
    ]);
  }

  @Get('live')
  @HealthCheck()
  async liveness(): Promise<HealthCheckResult> {
    return this.health.check([
      () =>
        Promise.resolve({
          'email-workers': {
            status: 'up',
            timestamp: new Date().toISOString(),
          },
        }),
    ]);
  }
}
