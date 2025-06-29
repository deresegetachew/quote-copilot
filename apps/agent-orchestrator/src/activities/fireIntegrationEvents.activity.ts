import { ClientProxy } from '@nestjs/microservices';
import { INTEGRATION_EVENT_CLIENT } from '../../../../libs/common/src';
import { AppContext } from '../appContext';
import { Logger } from '@nestjs/common';
import { z, ZodSchema } from 'zod';

export type TFireIntegrationEventsActivityParams<T> = {
  subject: string;
  schema: ZodSchema<T>;
  eventPayload: z.infer<ZodSchema<T>>;
};

// TODO: don't relay on NATS directly instead use factory and use port and adapter
export async function fireIntegrationEventsActivity<T>(
  param: TFireIntegrationEventsActivityParams<T>,
) {
  const { subject, schema, eventPayload } = param;

  const logger = new Logger(
    'Running Activity::fireIntegrationEvents::' + subject,
  );

  const { evtClient } = await initActivity();

  try {
    logger.debug(
      'Firing integration events with subject:',
      subject,
      eventPayload,
    );

    // validateWithSchema(schema, eventPayload);

    // await evtClient.emit(subject, eventPayload);
  } catch (error) {
    logger.error('Error firing integration events:', error);
    throw error;
  }
}

async function initActivity() {
  const app = AppContext.get();
  const evtClient = app.get<ClientProxy>(INTEGRATION_EVENT_CLIENT);

  return { evtClient };
}

function validateWithSchema<T>(schema: z.ZodSchema<T>, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new Error(
      'Validation failed: ' + JSON.stringify(result.error.format()),
    );
  }
  return result.data;
}
