import { Injectable, Scope } from '@nestjs/common';
import { PromptBody } from '../../../prompts/src';
import { ClientStrategy } from './clientStrategy.interface';
import { OpenAIClient } from './openai.client';
import { OllamaClient } from './ollama.client';
import { AIMessageChunk } from '@langchain/core/messages';
import { AIClientTypes } from '@common';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class LLMClient {
  constructor(
    private readonly openAIClient: OpenAIClient,
    private readonly ollamaClient: OllamaClient,
  ) {}

  private strategy: ClientStrategy;

  setStrategy(strategy: AIClientTypes) {
    if (strategy === 'openAI') {
      this.strategy = this.openAIClient;
    } else if (strategy === 'ollama') {
      this.strategy = this.ollamaClient;
    } else {
      throw new Error(`Unknown strategy: ${strategy}`);
    }
  }

  public async invokeLLM(messages: PromptBody): Promise<AIMessageChunk> {
    if (!this.strategy) {
      throw new Error('Client strategy is not initialized');
    }
    return await this.strategy.invokeLLM(messages);
  }
}
