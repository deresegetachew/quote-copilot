import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { TConfiguration } from '@app-config/config';

@Injectable()
export class MongooseConnectionFactory implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    const dbConfig = this.configService.getOrThrow<
      TConfiguration['dbConfig']['mongo']['document-worker-db']
    >('dbConfig.mongo.document-worker-db');

    if (dbConfig.authMode === 'password') {
      return {
        uri: dbConfig.uri,
        dbName: dbConfig.database,
        auth: {
          username: dbConfig.username,
          password: dbConfig.password,
        },

        connectionFactory: (connection) => {
          return connection;
        },
      };
    } else {
      throw new Error(
        'MongoDB connection factory is not implemented for this auth mode',
      );
    }
  }
}
