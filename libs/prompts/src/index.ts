export * from './prompts.module';
export * from './services/prompts.service';

export * from './promptBuilder.abstract';
export * from './promptFactory';

export * from './types';

export enum PromptKeys {
  CONFIRMATION = 'confirmation',
  GENERATE_QUOTE = 'generateQuote',
  PARSE_EMAIL = 'parseEmail',
  RESEND_EMAIL = 'resendEmail',
  STATUS_UPDATE = 'statusUpdate',
}
