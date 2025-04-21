export interface PromptBody {
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
  templateVariables?: Record<string, any>[];
}

export interface ProcurementPrompts {
  parseEmailPrompt: PromptBody;
  resendEmailPrompt: PromptBody;
  generateQuotePrompt: PromptBody;
  confirmationPrompt: PromptBody;
  statusUpdatePrompt: PromptBody;
}

// interface ProcurementPromptsV2 {
//   parseEmailPrompt: string;
//   resendEmailPrompt: string;
//   generateQuotePrompt: string;
//   confirmationPrompt: string;
//   statusUpdatePrompt: string;
//   procurementProcessPrompt: string;
// }
