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
      aiStrategy: (process.env.AI_STRATEGY as "openAI" | "ollama" | "gemini") || 'gemini',
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
        redirectUri: process.env.GMAIL_REDIRECT_URI || '',
        scopes: process.env.GMAIL_SCOPES?.split(',') || [],
      },
      openAIConfig: {
        apiKey: this.getEnvVarOrThrow('OPENAI_API_KEY'),
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.1'),
      },
      ollamaConfig: {
        model: process.env.OLLAMA_MODEL || 'llama3.2',
        temperature: parseFloat(process.env.OLLAMA_TEMPERATURE || '0.1'),
        serverUrl: process.env.OLLAMA_SERVER_URL || 'http://localhost:11434',
      },
      geminiConfig: {
        apiKey: this.getEnvVarOrThrow('GEMINI_API_KEY'),
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.1'),
      },
      attachmentConfig: {
        enabled: this.getBooleanFromEnv(process.env.ATTACHMENT_ENABLED) || false,
        maxFileSize: parseInt(process.env.ATTACHMENT_MAX_FILE_SIZE || '10485760', 10),
        allowedMimeTypes: process.env.ATTACHMENT_ALLOWED_MIME_TYPES?.split(',') || [
          'text/csv',
          'application/pdf',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
        enableVirusScanning: this.getBooleanFromEnv(process.env.ATTACHMENT_ENABLE_VIRUS_SCANNING) || true,
        enableContentScanning: this.getBooleanFromEnv(process.env.ATTACHMENT_ENABLE_CONTENT_SCANNING) || true,
        tempDirectory: process.env.ATTACHMENT_TEMP_DIRECTORY || '/tmp/attachments',
        retentionPeriodDays: parseInt(process.env.ATTACHMENT_RETENTION_PERIOD_DAYS || '7', 10),
        processingTimeoutMs: parseInt(process.env.ATTACHMENT_PROCESSING_TIMEOUT_MS || '30000', 10),
      },
      corsConfig: {
        origins: process.env.CORS_ORIGINS?.split(',') || [
          'http://localhost:3000',
          'http://localhost:3001', 
          'http://localhost:3003',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
          'http://127.0.0.1:3003',
        ],
        methods: process.env.CORS_METHODS?.split(',') || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(',') || ['Content-Type', 'Authorization', 'Accept'],
        credentials: this.getBooleanFromEnv(process.env.CORS_CREDENTIALS) || true,
      },
      minioConfig: {
        endpoint: this.getEnvVarOrThrow('MINIO_ENDPOINT'),
        accessKey: this.getEnvVarOrThrow('MINIO_ACCESS_KEY'),
        secretKey: this.getEnvVarOrThrow('MINIO_SECRET_KEY'),
        bucketName: process.env.MINIO_BUCKET_NAME || 'attachments'
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
