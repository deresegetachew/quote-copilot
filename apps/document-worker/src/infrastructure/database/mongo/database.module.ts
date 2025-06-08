import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConnectionFactory } from './connection.factory';
import {
  DocumentSchema,
  DocumentSchemaFactory,
} from './schemas/document.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongooseConnectionFactory,
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: DocumentSchema.name, schema: DocumentSchemaFactory },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
