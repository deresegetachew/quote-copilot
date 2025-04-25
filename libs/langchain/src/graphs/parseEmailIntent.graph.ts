import { Injectable } from '@nestjs/common';
import { OpenAIClient } from '../clients/openai.client';
import { PromptBody } from '@prompts';

type ParseEmailIntentResponse = {
  originalInput: PromptBody;
  parsedEmail: string;
};

@Injectable()
export class ParseEmailIntentGraph {
  constructor(private readonly openAIClient: OpenAIClient) {}

  async parseEmailWithLLM(
    inputPrompt: PromptBody,
  ): Promise<ParseEmailIntentResponse> {
    const response = await this.openAIClient.invokeLLM(inputPrompt);
    if (!response) {
      throw new Error('Failed to parse email');
    }

    return {
      originalInput: inputPrompt,
      parsedEmail: response,
    };
  }
}
