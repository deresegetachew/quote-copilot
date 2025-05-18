import { ConfigService } from '@nestjs/config';
import { getAppContext } from '../../getAppContext';
import { HttpService } from '@nestjs/axios';
import { EmailThreadResponseDTO, fetchObservableResult } from '@common';

import { Logger } from '@nestjs/common';
import { ParseEmailIntentGraph } from '@tools-langchain';
import { DateTime } from 'luxon';
import { TParseEmailActivityResponse } from './type';
import { ParseEmailIntentActivityMapper } from './parseEmailIntentActivity.mapper';
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

  const { configService, httpService, parseEmailIntentGraph } =
    await initActivity();

  const data = await fetchEmailThread(configService, httpService, threadId);
  // logger.log('📧 🧵 Email Thread retrieved from  email worker', data);

  try {
    const messages = data.emails
      .sort(
        (a, b) =>
          DateTime.fromISO(a.receivedAt).toMillis() -
          DateTime.fromISO(b.receivedAt).toMillis(),
      )
      .map((email) => email.body);

    const llmResponse = await parseEmailIntentGraph.parseEmailWithLLM(
      threadId,
      messages,
    );

    logger.log('🤖 parsed LLM Response:', {
      threadId: llmResponse.threadId,
      isRFQ: llmResponse.isRFQ,
      reason: llmResponse.reason,
    });
    return ParseEmailIntentActivityMapper.from(llmResponse);
  } catch (error) {
    logger.error('Error parsing email:', error);
    throw error;
  }
}

async function fetchEmailThread(
  configService: ConfigService<unknown, boolean>,
  httpService: HttpService,
  threadId: string,
) {
  const baseURL = 'http://' + configService.get('apps.emailWorker.baseUrl');

  const request = httpService.get(
    `${baseURL}/email-workers/email-threads/${threadId}/messages`,
  );

  const data = await fetchObservableResult<EmailThreadResponseDTO>(request);
  return data;
}

async function initActivity() {
  const app = await getAppContext();
  const configService = app.get(ConfigService);
  const httpService = app.get(HttpService);
  const parseEmailIntentGraph = app.get(ParseEmailIntentGraph);
  return { configService, httpService, parseEmailIntentGraph };
}
