import { Injectable } from '@nestjs/common';
import { ClientStrategy } from './clientStrategy.interface';
import { ConfigService } from '@nestjs/config';
import { ChatOllama } from '@langchain/ollama';
import { TConfiguration } from '../../../config/src';

import { ChatPromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class OllamaClient implements ClientStrategy {
  private modelInstance: ChatOllama;

  constructor(private configService: ConfigService) {}

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
}
