import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TConfiguration } from '@app-config/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

import { ClientStrategy } from './clientStrategy.interface';

@Injectable()
export class GeminiClient implements ClientStrategy {
  private modelInstance: ChatGoogleGenerativeAI;

  constructor(private configService: ConfigService) {}

  private async initialize() {
    const geminiConfig =
      this.configService.getOrThrow<TConfiguration['geminiConfig']>(
        'geminiConfig',
      );

    this.modelInstance = new ChatGoogleGenerativeAI({
      apiKey: geminiConfig.apiKey,
      model: geminiConfig.model,
      temperature: geminiConfig.temperature,
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