export * from './prompts.module';
export * from './services/prompts.service';

export * from './promptBuilder.abstract';
export * from './llmPrompts/builder';

export * from './types';

export enum PromptKeys {
  EXTRACT_RFQ_DETAILS = 'PARSE_CUSTOMER_RFQ_EMAIL',
  SUMMARIZE_MESSAGE = 'SUMMARIZE_MESSAGE',
  CLASSIFY_MESSAGE_AS_RFQ = 'CLASSIFY_MESSAGE_AS_RFQ',
}
