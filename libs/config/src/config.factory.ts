import * as fs from 'fs';
import * as yaml from 'yaml';
import { ConfigSchema, TConfiguration } from './config.model';

export abstract class ConfigFactory {
  public abstract getConfig(): TConfiguration;

  public getBooleanFromEnv(val: string | undefined | null): boolean {
    return val === 'true' || val === '1';
  }
}

export class EnvConfigFactory extends ConfigFactory {
  constructor() {
    super();
  }

  getConfig(): TConfiguration {
    return {
      name: this.getEnvVarOrThrow('APP_NAME'),
      dbConfig: {
        mongo: {
          'email-worker-db': {
            uri: this.getEnvVarOrThrow('DB_MONGO_URI'),
            authMode:
              this.getEnvVarOrThrow('DB_MONGO_AUTH_MODE') === 'aws-iam'
                ? 'aws-iam'
                : 'password',
            database: this.getEnvVarOrThrow('DB_MONGO_DATABASE'),
            enableMigration: this.getBooleanFromEnv(
              this.getEnvVarOrThrow('DB_MONGO_ENABLE_MIGRATION'),
            ),
            username: this.getEnvVarOrThrow('DB_MONGO_USERNAME'),
            password: this.getEnvVarOrThrow('DB_MONGO_PASSWORD'),
            replicaSet: '',
            useSSL: false,
          },

          'core-db': {
            uri: this.getEnvVarOrThrow('DB_MONGO_URI'),
            authMode:
              this.getEnvVarOrThrow('DB_MONGO_AUTH_MODE') === 'aws-iam'
                ? 'aws-iam'
                : 'password',
            database: this.getEnvVarOrThrow('DB_MONGO_DATABASE'),
            enableMigration: this.getBooleanFromEnv(
              this.getEnvVarOrThrow('DB_MONGO_ENABLE_MIGRATION'),
            ),
            username: this.getEnvVarOrThrow('DB_MONGO_USERNAME'),
            password: this.getEnvVarOrThrow('DB_MONGO_PASSWORD'),
            replicaSet: '',
            useSSL: false,
          },

          'document-worker-db': {
            uri: this.getEnvVarOrThrow('DB_MONGO_URI'),
            authMode:
              this.getEnvVarOrThrow('DB_MONGO_AUTH_MODE') === 'aws-iam'
                ? 'aws-iam'
                : 'password',
            database: this.getEnvVarOrThrow('DB_MONGO_DATABASE'),
            enableMigration: this.getBooleanFromEnv(
              this.getEnvVarOrThrow('DB_MONGO_ENABLE_MIGRATION'),
            ),
            username: this.getEnvVarOrThrow('DB_MONGO_USERNAME'),
            password: this.getEnvVarOrThrow('DB_MONGO_PASSWORD'),
            replicaSet: '',
            useSSL: false,
          },
        },
      },
      apps: {
        api: {
          name: this.getEnvVarOrThrow('APP_NAME'),
          port: parseInt(this.getEnvVarOrThrow('APP_PORT'), 10),
          baseUrl: this.getEnvVarOrThrow('API_BASE_URL'),
        },
        emailWorker: {
          name: this.getEnvVarOrThrow('APP_NAME'),
          port: parseInt(this.getEnvVarOrThrow('APP_PORT'), 10),
          baseUrl: this.getEnvVarOrThrow('EMAIL_WORKER_BASE_URL'),
        },
        telegramWorker: {
          name: this.getEnvVarOrThrow('APP_NAME'),
          port: parseInt(this.getEnvVarOrThrow('APP_PORT'), 10),
          baseUrl: this.getEnvVarOrThrow('TELEGRAM_WORKER_BASE_URL'),
        },
        whatsAppWorker: {
          name: this.getEnvVarOrThrow('APP_NAME'),
          port: parseInt(this.getEnvVarOrThrow('APP_PORT'), 10),
          baseUrl: this.getEnvVarOrThrow('WHATSAPP_WORKER_BASE_URL'),
        },
        coreService: {
          name: this.getEnvVarOrThrow('APP_NAME'),
          port: parseInt(this.getEnvVarOrThrow('APP_PORT'), 10),
          baseUrl: this.getEnvVarOrThrow('CORE_SERVICE_BASE_URL'),
        },
        documentWorker: {
          name: this.getEnvVarOrThrow('APP_NAME'),
          port: parseInt(this.getEnvVarOrThrow('APP_PORT'), 10),
          baseUrl: this.getEnvVarOrThrow('DOCUMENT_WORKER_BASE_URL'),
        },
      },
      temporalConfig: {
        namespace: this.getEnvVarOrThrow('TEMPORAL_NAMESPACE'),
        address: this.getEnvVarOrThrow('TEMPORAL_ADDRESS'),
      },
      natsConfig: {
        url: this.getEnvVarOrThrow('NATS_URL'),
      },
      gmailConfig: {
        clientId: this.getEnvVarOrThrow('GMAIL_CLIENT_ID'),
        clientSecret: this.getEnvVarOrThrow('GMAIL_CLIENT_SECRET'),
        refreshToken: this.getEnvVarOrThrow('GMAIL_REFRESH_TOKEN'),
        redirectUri: '',
        scopes: [],
      },
      openAIConfig: {
        apiKey: this.getEnvVarOrThrow('OPENAI_API_KEY'),
        model: '',
        temperature: 0,
      },
      ollamaConfig: {
        model: '',
        temperature: 0,
        serverUrl: '',
      },
      geminiConfig: {
        apiKey: this.getEnvVarOrThrow('GEMINI_API_KEY'),
        model: '',
        temperature: 0,
      },
    };
  }

  getEnvVarOrThrow(variableName: string): string {
    const value = process.env[variableName];
    if (!value) {
      throw new Error(`Environment variable ${variableName} is not set.`);
    }
    return value;
  }
}

export class StaticConfigFactory extends ConfigFactory {
  constructor(private readonly filePath: string) {
    super();
  }

  private configFilePath = this.filePath;

  getConfig() {
    if (!fs.existsSync(this.configFilePath)) {
      throw new Error(
        `local config file not set, please create a config file at  ${this.configFilePath}`,
      );
    } else {
      try {
        const fileContents = fs.readFileSync(this.configFilePath, 'utf8');
        const rawData = yaml.parse(fileContents);

        const validatedConfigData = ConfigSchema.parse(rawData);

        return validatedConfigData;
      } catch (e) {
        console.log(e);
        throw new Error(
          `Failed to loading configuration file ${JSON.stringify(e)}`,
        );
      }
    }
  }
}
