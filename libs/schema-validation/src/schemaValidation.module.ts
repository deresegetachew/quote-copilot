import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ZodValidationInterceptor } from './interceptors';
import { SchemaValidationPipe } from './pipes';

@Global()
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodValidationInterceptor,
    },
    SchemaValidationPipe,
  ],
  exports: [SchemaValidationPipe],
})
export class SchemaValidationModule {}
