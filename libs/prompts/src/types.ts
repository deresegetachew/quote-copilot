export interface PromptBody<T> {
  systemPrompt: string;
  userPrompt: string;
  description?: string;
  exampleInput?: string;
  exampleOutput?: string;
  responseFormat?: string;
  responseFormatDescription?: string;
  responseFormatExample?: string;
  temperature?: number;
  tone?: string;
  audience?: string;
  metadataTags?: string[];
  toolCallsRequired?: boolean;
  fallbackPromptKey?: string;
  maxTokens?: number;
  templateVariables?: T;
}
