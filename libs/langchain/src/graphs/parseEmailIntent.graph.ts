import { Injectable } from '@nestjs/common';
import { LLMClient } from '../clients';
import { PromptBody } from '@prompts';
import { AIMessageChunk } from '@langchain/core/messages';

type ParseEmailIntentResponse = {
  originalInput: PromptBody;
  parsedEmail: AIMessageChunk;
};

@Injectable()
export class ParseEmailIntentGraph {
  constructor(private readonly llmClient: LLMClient) {}

  async parseEmailWithLLM(
    inputPrompt: PromptBody,
  ): Promise<ParseEmailIntentResponse> {
    this.llmClient.setStrategy('openAI');
    const response = await this.llmClient.invokeLLM(inputPrompt);
    if (!response) {
      throw new Error('Failed to parse email');
    }

    return {
      originalInput: inputPrompt,
      parsedEmail: response,
    };
  }
}
