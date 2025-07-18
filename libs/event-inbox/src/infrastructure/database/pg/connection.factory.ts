import { IDatabaseDriver, Connection } from '@mikro-orm/core';
import {
  MikroOrmModuleOptions,
  MikroOrmOptionsFactory,
} from '@mikro-orm/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConnectionFactory implements MikroOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  createMikroOrmOptions(
    contextName?: string,
  ):
    | MikroOrmModuleOptions<IDatabaseDriver<Connection>>
    | Promise<MikroOrmModuleOptions<IDatabaseDriver<Connection>>> {
    const dbConfig = this.configService.getOrThrow(
      'eventInboxConfig.pg["event-inbox-db"]',
    );

    if (dbConfig.authMode === 'password') {
      return {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.username,
        password: dbConfig.password,
        dbName: dbConfig.databaseName,
        autoLoadEntities: dbConfig.autoLoadEntities,
      };
    } else {
      throw new Error(
        'PostgreSQL connection factory is not implemented for this auth mode',
      );
    }
  }
}
