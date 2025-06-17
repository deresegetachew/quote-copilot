import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
} from '@nestjs/terminus';
import { CustomHealthIndicator } from '@common/health';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly customHealth: CustomHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.customHealth.checkTelegramBot('telegram-bot'),
      () => this.customHealth.checkNATSConnection('nats'),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.customHealth.checkTelegramBot('telegram-bot'),
    ]);
  }

  @Get('live')
  @HealthCheck()
  async liveness(): Promise<HealthCheckResult> {
    return this.health.check([
      () =>
        Promise.resolve({
          'telegram-workers': {
            status: 'up',
            timestamp: new Date().toISOString(),
          },
        }),
    ]);
  }
}
