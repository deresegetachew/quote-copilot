import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ZodValidationInterceptor } from './interceptors';

@Global()
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodValidationInterceptor,
    },
  ],
  exports: [],
})
export class SchemaValidationModule {}
