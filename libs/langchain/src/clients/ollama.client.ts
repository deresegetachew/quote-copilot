import { Injectable } from '@nestjs/common';
import { ClientStrategy } from './clientStrategy.interface';
import { ConfigService } from '@nestjs/config';
import { ChatOllama } from '@langchain/ollama';
import { TConfiguration } from '../../../config/src';
import { PromptBody } from '../../../prompts/src';
import {
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class OllamaClient implements ClientStrategy {
  private modelInstance: ChatOllama;

  constructor(private configService: ConfigService) {
    this.modelInstance = null;
  }

  private async initialize() {
    const ollamaConfig =
      this.configService.getOrThrow<TConfiguration['ollamaConfig']>(
        'ollamaConfig',
      );

    this.modelInstance = new ChatOllama({
      baseUrl: ollamaConfig.serverUrl,
      model: ollamaConfig.model,
      temperature: ollamaConfig.temperature,
    });
  }

  public async getModel() {
    if (!this.modelInstance) {
      await this.initialize();
    }
    return this.modelInstance;
  }

  public async invokeLLM(input: PromptBody<any>): Promise<AIMessageChunk> {
    // TODO:  move repetitive logic to llmClient class
    const tone = `Use a ${input.tone} tone when responding`;
    const audience = `The audience is ${input.audience}`;

    const promptTemplate = ChatPromptTemplate.fromMessages([
      new SystemMessage(`${tone} ${audience}. ${input.systemPrompt}`),
      new HumanMessage(input.userPrompt),
    ]);

    const client = await this.getModel();

    return client.invoke(await promptTemplate.formatMessages({}));
  }
}
