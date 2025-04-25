import { Injectable } from '@nestjs/common';
import { ClientStrategy } from './clientStrategy.interface';
import { ConfigService } from '@nestjs/config';
import { Ollama } from '@langchain/ollama';
import { TConfiguration } from '../../../config/src';
import { PromptBody } from '../../../prompts/src';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class OllamaClient implements ClientStrategy {
  private llmClient: any;

  constructor(private configService: ConfigService) {
    this.llmClient = null;
  }

  private async initialize() {
    const ollamaConfig =
      this.configService.getOrThrow<TConfiguration['ollamaConfig']>(
        'ollamaConfig',
      );

    this.llmClient = new Ollama({
      baseUrl: ollamaConfig.serverUrl,
      model: ollamaConfig.model,
      temperature: ollamaConfig.temperature,
    });
  }

  private async getClient() {
    if (!this.llmClient) {
      await this.initialize();
    }
    return this.llmClient;
  }

  public async invokeLLM(input: PromptBody): Promise<any> {
    // TODO:  move repetitive logic to llmClient class
    const tone = `Use a ${input.tone} tone when responding`;
    const audience = `The audience is ${input.audience}`;

    const promptTemplate = ChatPromptTemplate.fromMessages([
      new SystemMessage(`${tone} ${audience}. ${input.systemPrompt}`),
      new HumanMessage(input.userPrompt),
    ]);

    const client = await this.getClient();

    return client.invoke(await promptTemplate.formatMessages({}));
  }
}
