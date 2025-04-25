import { z } from 'zod';

export const ConfigSchema = z.object({
  name: z.string(),
  authConfig: z.any().optional(),
  awsConfig: z.any().optional(),
  azureConfig: z.any().optional(),
  gcpConfig: z.any().optional(),
  httpConfig: z.any().optional(),
  openApiConfig: z.any().optional(),
  dbConfig: z
    .object({
      mongo: z
        .object({
          uri: z.string(),
          authMode: z.enum(['password', 'aws-iam']),
          username: z.string(),
          password: z.string(),
          database: z.string(),
          enableMigration: z.boolean(),
          replicaSet: z.string().optional(),
          useSSL: z.boolean(),
        })
        .optional(),
      postgres: z
        .object({
          type: z.literal('postgres'),
          databaseName: z.string(),
          host: z.string(),
          port: z.number(),
          password: z.string(),
          username: z.string(),
          autoLoadEntities: z.boolean(),
        })
        .optional(),
    })
    .optional(),
  cacheConfig: z
    .object({
      redis: z.object({
        host: z.string(),
        username: z.string(),
        password: z.string(),
      }),
    })
    .optional(),
  loggingConfig: z
    .object({
      environment: z.string(),
      logLevel: z.string(),
      serviceName: z.string(),
      isJson: z.boolean(),
    })
    .optional(),
  apps: z.object({
    api: z.object({
      name: z.string(),
      port: z.number(),
      baseUrl: z.string(),
    }),
    emailWorker: z.object({
      name: z.string(),
      port: z.number(),
      baseUrl: z.string(),
    }),
    telegramWorker: z.object({
      name: z.string(),
      port: z.number(),
      baseUrl: z.string(),
    }),
    whatsAppWorker: z.object({
      name: z.string(),
      port: z.number(),
      baseUrl: z.string(),
    }),
  }),
  gmailConfig: z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    redirectUri: z.string(),
    refreshToken: z.string(),
    scopes: z.array(z.string()),
  }),
  temporalConfig: z.object({
    namespace: z.string(),
    address: z.string(),
  }),
  openAIConfig: z.object({
    apiKey: z.string(),
    model: z.string(),
    temperature: z.number(),
  }),
});

export type TConfiguration = z.infer<typeof ConfigSchema>;
