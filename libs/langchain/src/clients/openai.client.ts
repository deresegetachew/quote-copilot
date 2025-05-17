import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TConfiguration } from '@app-config/config';
import { ChatOpenAI } from '@langchain/openai';

import { ClientStrategy } from './clientStrategy.interface';

@Injectable()
export class OpenAIClient implements ClientStrategy {
  private modelInstance: ChatOpenAI;

  constructor(private configService: ConfigService) {}

  private async initialize() {
    const openAIConfig =
      this.configService.getOrThrow<TConfiguration['openAIConfig']>(
        'openAIConfig',
      );

    this.modelInstance = new ChatOpenAI({
      apiKey: openAIConfig.apiKey,
      model: openAIConfig.model,
      temperature: openAIConfig.temperature,
      streaming: false,
    });
  }

  public async getModel() {
    if (!this.modelInstance) {
      await this.initialize();
    }

    return this.modelInstance;
  }
}
