import * as fs from 'fs';
import * as path from 'path';
import { PromptBody } from './types';
import { renderTemplate } from './util/handleBars.helper';

export abstract class AbstractPromptBuilder<T> {
  protected prompt: PromptBody;
  protected context: T;

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
      templateVariables: [],
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

  protected setSystemPrompt(): this {
    this.prompt.systemPrompt = this.parseTemplate('system', {});
    return this;
  }

  protected setUserPrompt(): this {
    this.prompt.userPrompt = this.parseTemplate('user', {});
    return this;
  }

  protected abstract setAudience(audience: string): this;
  protected abstract setTone(tone: string): this;
  protected abstract setTemplateVariables(
    templateVariables: Record<string, any>[],
  ): this;

  setContext(context: T): this {
    this.context = context;
    return this;
  }

  build(): PromptBody {
    // order of method calls matters
    // as they set the properties of the prompt object
    // and some methods depend on others

    return this.setTone(this.prompt.tone)
      .setAudience(this.prompt.audience)
      .setTemperature(this.prompt.temperature)
      .setMaxTokens(this.prompt.maxTokens)
      .setTemplateVariables(this.prompt.templateVariables)

      .setSystemPrompt()
      .setUserPrompt().prompt;
  }

  private parseTemplate(
    templateName: string,
    data: Record<string, any>,
  ): string {
    const templatePath = path.resolve(
      __dirname,
      'templates',
      'confirmation',
      `${templateName}.prompt.hbs`,
    );
    if (fs.existsSync(templatePath)) {
      return renderTemplate(templatePath, data);
    }
    throw new Error(
      `Prompt Template file not found: ${templatePath}. Please check the template name and path.`,
    );
  }
}
