import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConnectionFactory } from './connection.factory';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongooseConnectionFactory,
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
