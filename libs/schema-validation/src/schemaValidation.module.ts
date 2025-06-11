import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { SchemaValidationInterceptor } from './interceptors';

@Global()
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SchemaValidationInterceptor,
    },
  ],
  exports: [],
})
export class SchemaValidationModule {}
