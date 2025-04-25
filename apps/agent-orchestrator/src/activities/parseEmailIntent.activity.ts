import { ConfigService } from '@nestjs/config';
import { getAppContext } from '../getAppContext';
import { HttpService } from '@nestjs/axios';
import { EmailThreadResponseDTO, fetchObservableResult } from '@common';
import { ParseCustomerRFQEmailPromptBuilder } from '@prompts';
import { Logger } from '@nestjs/common';
import { ParseEmailIntentGraph } from '@tools-langchain';

// why are we doing this and not class,  temporal expects activities to be FN
// hence to access the DI container we have to use explicit getters
export async function parseEmailIntentActivity(
  threadId: string,
  messageId: string,
): Promise<{ threadId: string; partNumber: string; quantity: number }> {
  console.log('Parsing email intent with threadId:', threadId, messageId);

  const app = await getAppContext();
  const configService = app.get(ConfigService);
  const httpService = app.get(HttpService);
  const parseCustomerRFQEmailPromptBuilder = app.get(
    ParseCustomerRFQEmailPromptBuilder,
  );
  const parseEmailIntentGraph = app.get(ParseEmailIntentGraph);

  const logger = new Logger('parseEmailIntentActivity');

  const baseURL = 'http://' + configService.get('apps.emailWorker.baseUrl');

  const request = httpService.get(
    `${baseURL}/email-workers/email-threads/${threadId}/messages`,
  );

  const data = await fetchObservableResult<EmailThreadResponseDTO>(request);

  logger.log('📧 🧵 Email Thread retrieved from  email worker', data);

  try {
    const prompt = parseCustomerRFQEmailPromptBuilder
      .setContext({
        tenantName: 'DummyTenant',
        id: data.id,
        threadId: data.threadId,
        status: data.status,
        emails: data.emails,
      })
      .build();

    logger.log('🥁 Prompt:', { prompt });
    const llmResponse = await parseEmailIntentGraph.parseEmailWithLLM(prompt);
    logger.log('🤖 LLM Response:', { llmResponse });
  } catch (error) {
    logger.error('Error parsing email:', error);
    throw error;
  }

  // in the future we will fire langgraph to parse the email
  return { threadId, partNumber: 'ABC123', quantity: 1 };
}
