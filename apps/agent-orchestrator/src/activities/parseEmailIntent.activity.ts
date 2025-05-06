import { ConfigService } from '@nestjs/config';
import { getAppContext } from '../getAppContext';
import { HttpService } from '@nestjs/axios';
import { EmailThreadResponseDTO, fetchObservableResult } from '@common';
import {
  ParseCustomerRFQEmailPromptBuilder,
  TEmailIntentRFQResponseSchemaType,
  emailIntentRFQResponseSchema,
  emailIntentRFQResponseSchemaTxt,
} from '@prompts';
import { Logger } from '@nestjs/common';
import { ParseEmailIntentGraph } from '@tools-langchain';
// why are we doing this and not class,  temporal expects activities to be FN
// hence to access the DI container we have to use explicit getters

type TParseEmailResult =
  | {
      status: 'RFQ_PARSED';
      data: TEmailIntentRFQResponseSchemaType;
    }
  | {
      status: 'INCOMPLETE_RFQ';
      data: null;
    }
  | {
      status: 'NOT_RFQ';
      data: null;
    };

export async function parseEmailIntentActivity(
  threadId: string,
  messageId: string,
): Promise<TParseEmailResult> {
  console.log('Parsing email intent with threadId:', threadId, messageId);

  const app = await getAppContext();
  const configService = app.get(ConfigService);
  const httpService = app.get(HttpService);
  const parseEmailIntentGraph = app.get(ParseEmailIntentGraph);

  const logger = new Logger('parseEmailIntentActivity');

  const baseURL = 'http://' + configService.get('apps.emailWorker.baseUrl');

  const request = httpService.get(
    `${baseURL}/email-workers/email-threads/${threadId}/messages`,
  );

  const data = await fetchObservableResult<EmailThreadResponseDTO>(request);

  logger.log('📧 🧵 Email Thread retrieved from  email worker', data);

  try {
    // const parseCustomerRFQEmailPromptBuilder = await app.resolve(
    //   ParseCustomerRFQEmailPromptBuilder,
    // );

    // const prompt = await parseCustomerRFQEmailPromptBuilder
    //   .setContext({
    //     tenantName: 'DummyTenant',
    //     id: data.id,
    //     threadId: data.threadId,
    //     status: data.status,
    //     emails: data.emails,
    //     responseSchema: emailIntentRFQResponseSchemaTxt,
    //   })
    //   .build();

    const llmResponse = await parseEmailIntentGraph.parseEmailWithLLM(prompt);

    const result = emailIntentRFQResponseSchema.safeParse(
      llmResponse.parsedEmail.content,
    );

    logger.log('🤖 parsed LLM Response:', result);

    if (!result.success) {
      logger.error('Error parsing email:', result.error);
      // fire human in the loop activity

      return { status: 'INCOMPLETE_RFQ', data: null };
    } else {
      const parsedData = result.data;

      if (!parsedData.isRFQ) return { status: 'NOT_RFQ', data: null };

      return { status: 'RFQ_PARSED', data: parsedData };
    }
  } catch (error) {
    logger.error('Error parsing email:', error);
    throw error;
  }
}
