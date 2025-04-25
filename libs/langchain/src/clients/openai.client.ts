import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TConfiguration } from '@app-config/config';
import { ChatOpenAI } from '@langchain/openai';
import { PromptBody } from '@prompts';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

@Injectable()
export class OpenAIClient {
  private llmClient: ChatOpenAI;

  constructor(private configService: ConfigService) {}

  private async initialize() {
    const openAIConfig =
      this.configService.get<TConfiguration['openAIConfig']>('openAIConfig');

    this.llmClient = new ChatOpenAI({
      apiKey: openAIConfig.apiKey,
      model: openAIConfig.model,
      temperature: openAIConfig.temperature,
    });
  }

  private async getClient() {
    if (!this.llmClient) {
      await this.initialize();
    }
    return this.llmClient;
  }

  public async invokeLLM(input: PromptBody): Promise<any> {
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
