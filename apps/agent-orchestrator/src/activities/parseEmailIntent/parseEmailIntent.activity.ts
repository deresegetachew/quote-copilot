import { ConfigService } from '@nestjs/config';
import { AppContext } from '../../appContext';
import { HttpService } from '@nestjs/axios';
import { EmailThreadResponseDTO, fetchObservableResult } from '@common';

import { Logger } from '@nestjs/common';
import { ParseEmailIntentGraph } from '@tools-langchain';
import { DateTime } from 'luxon';
import { TParseEmailActivityResponse } from './type';
import { ParseEmailIntentActivityMapper } from './parseEmailIntentActivity.mapper';
import { CoreServiceClient } from '@common/clients/http';
// why are we doing this and not class,  temporal expects activities to be FN
// hence to access the DI container we have to use explicit getters

export async function parseEmailIntentActivity(
  threadId: string,
  messageId: string,
): Promise<TParseEmailActivityResponse> {
  const logger = new Logger(
    'Running Activity::parseEmailIntentActivity::' + threadId,
  );
  logger.log('Parsing email intent with threadId:', threadId, messageId);

  const { coreServiceClient } = await initActivity();

  try {
    const emailIntent = await coreServiceClient.parseMessageIntent(
      threadId,
      messageId,
    );

    return ParseEmailIntentActivityMapper.from(emailIntent);
  } catch (error) {
    logger.error('Error parsing email:', error);
    throw error;
  }
}

async function initActivity() {
  const app = await AppContext.get();
  const coreServiceClient = app.get(CoreServiceClient);

  return { coreServiceClient };
}
