import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectionFactory } from './connection.factory';
import { EventInbox } from './schemas/eventInbox.schema';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      useClass: ConnectionFactory,
      inject: [ConfigService],
    }),
    MikroOrmModule.forFeature([EventInbox]),
  ],
})
export class AppModule {}
