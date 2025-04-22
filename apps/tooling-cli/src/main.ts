import { CommandFactory } from 'nest-commander';
import { ToolingCliModule } from './tooling-cli.module';

async function bootstrap() {
  await CommandFactory.run(ToolingCliModule, {
    logger: ['error', 'warn', 'log'],
  });
}

bootstrap();
