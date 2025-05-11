import * as fs from 'fs';
import * as path from 'path';
import { PromptBody } from './types';
import { renderTemplateOrThrow } from './util/handleBars.helper';

// TO REMove not sure if we need this
export abstract class AbstractPromptBuilder<TInput> {
  protected prompt: PromptBody<TInput>;
  protected context: TInput;
  protected templateFolder: string;

  constructor() {
    this.prompt = {
      systemPrompt: '',
      userPrompt: '',
      description: '',
      exampleInput: '',
      exampleOutput: '',
      responseFormat: '',
      responseFormatDescription: '',
      responseFormatExample: '',
      templateVariables: undefined,
      tone: '',
      audience: '',
      temperature: 0.5,
      metadataTags: [],
      toolCallsRequired: false,
      fallbackPromptKey: '',
      maxTokens: 512,
    };
  }

  protected setTemperature(temperature: number): this {
    this.prompt.temperature = temperature;
    return this;
  }

  protected setMaxTokens(maxTokens: number): this {
    this.prompt.maxTokens = maxTokens;
    return this;
  }

  protected async setSystemPrompt(): Promise<this> {
    this.prompt.systemPrompt = await this.parseTemplateOrThrow('system', {});
    return this;
  }

  protected async setUserPrompt(): Promise<this> {
    this.prompt.userPrompt = await this.parseTemplateOrThrow('user', {});
    return this;
  }

  protected abstract setTemplateFolderPath(): this;
  protected abstract setAudience(audience: string): this;
  protected abstract setTone(tone: string): this;
  protected abstract setTemplateVariables(templateVariables: TInput): this;

  setContext(context: TInput): this {
    this.context = context;
    return this;
  }

  async build(): Promise<PromptBody<TInput>> {
    // order of method calls matters
    // as they set the properties of the prompt object
    // and some methods depend on others
    this.setTemplateFolderPath()
      .setTone(this.prompt.tone)
      .setAudience(this.prompt.audience)
      .setTemperature(this.prompt.temperature)
      .setMaxTokens(this.prompt.maxTokens)
      .setTemplateVariables(this.prompt.templateVariables);

    await this.setSystemPrompt();
    await this.setUserPrompt();

    return this.prompt;
  }

  private async parseTemplateOrThrow(
    templateName: string,
    data: Record<string, any>,
  ): Promise<string> {
    const templatePath = path.join(
      process.cwd(),
      'dist',
      'libs',
      'prompts',
      'src',
      'llmPrompts',
      'templates',
      `${this.templateFolder}/${templateName}.prompt.hbs`,
    );

    return await renderTemplateOrThrow(templatePath, data);
  }
}
