import { NestFactory } from '@nestjs/core';
import { DocumentWorkerModule } from './document-worker.module';

async function bootstrap() {
  const app = await NestFactory.create(DocumentWorkerModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
