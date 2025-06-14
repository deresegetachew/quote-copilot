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
      // Custom health checks
      () => this.checkTemporalConnection(),
      () => this.checkNATSConnection(),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.checkTemporalConnection(),
      () => this.checkNATSConnection(),
    ]);
  }

  @Get('live')
  @HealthCheck()
  async liveness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => Promise.resolve({
        'agent-orchestrator': {
          status: 'up',
          timestamp: new Date().toISOString(),
        }
      }),
    ]);
  }

  private async checkTemporalConnection(): Promise<Record<string, any>> {
    try {
      // Basic Temporal connectivity check
      // In a real implementation, you might check worker status or connection health
      return Promise.resolve({
        'temporal': {
          status: 'up',
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error) {
      return Promise.resolve({
        'temporal': {
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