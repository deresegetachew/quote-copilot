import { Injectable, Logger, Scope } from '@nestjs/common';
import { PromptBody } from '@prompts';
import { ClientStrategy } from './clientStrategy.interface';
import { OpenAIClient } from './openai.client';
import { OllamaClient } from './ollama.client';
import {
  AIMessageChunk,
  HumanMessage,
  MessageContent,
  SystemMessage,
} from '@langchain/core/messages';
import { AIClientTypes } from '@common';
import { z, ZodSchema } from 'zod';
import { ChatPromptTemplate } from '@langchain/core/prompts';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class LLMClient<TInput> {
  constructor(
    private readonly openAIClient: OpenAIClient,
    private readonly ollamaClient: OllamaClient,
  ) {}

  private logger = new Logger(LLMClient.name);

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

  // public async withStructuredOutput(schema: ZodSchema): Promise<this> {
  //   const client = await this.strategy.getModel();

  //   client.withStructuredOutput(schema);

  //   return this;
  // }

  public async invokeLLM<T extends ZodSchema>(
    messages: PromptBody<TInput>,
    structuredOutPutSchema?: T,
  ): Promise<z.infer<T>> {
    if (!this.strategy) {
      throw new Error('Client strategy is not initialized');
    }

    const tone = `Use a ${messages.tone} tone when responding`;
    const audience = `The audience is ${messages.audience}`;

    const promptTemplate = ChatPromptTemplate.fromMessages([
      new SystemMessage(`${tone} ${audience}. ${messages.systemPrompt}`),
      new HumanMessage(messages.userPrompt),
    ]);
    const model = await this.strategy.getModel();
    const rawResult = await model.invoke(
      await promptTemplate.formatMessages({}),
    );

    if (structuredOutPutSchema) {
      // const structuredModel = model.withStructuredOutput(
      //   structuredOutPutSchema,
      // );
      // return await structuredModel.invoke(
      //   await promptTemplate.formatMessages({}),
      // );

      const rawContent = this.getMessageContentAsString(rawResult.content);

      this.logger.debug('🤖🤖🤖---LLM Raw Response---🤖🤖🤖:', { rawContent });

      const match = rawContent.match(/```json\s*([\s\S]+?)\s*```/);
      if (!match) throw new Error('No valid JSON block found in LLM output.');

      const parsed = JSON.parse(match[1]);
      const validated = structuredOutPutSchema.parse(parsed);

      return validated;
    }

    return rawResult;
  }

  private getMessageContentAsString(content: MessageContent): string {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((chunk) => {
          if (typeof chunk === 'string') return chunk;
          if (chunk?.type === 'text' && typeof chunk.text === 'string')
            return chunk.text;
          return ''; // Ignore image_url or unknown chunks
        })
        .join('\n');
    }

    return '';
  }
}
