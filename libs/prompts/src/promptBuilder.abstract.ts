import { PromptBody } from './types';

export abstract class AbstractPromptBuilder {
  protected prompt: PromptBody;

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

  protected setMetadataTags(metadataTags: string[]): this {
    this.prompt.metadataTags = metadataTags;
    return this;
  }

  protected setFallbackPromptKey(fallbackPromptKey: string): this {
    this.prompt.fallbackPromptKey = fallbackPromptKey;
    return this;
  }

  protected abstract setAudience(audience: string): this;
  protected abstract setTone(tone: string): this;
  protected abstract setSystemPrompt(): this;
  protected abstract setUserPrompt(): this;
  protected abstract setExampleInput(): this;
  protected abstract setExampleOutput(): this;
  protected abstract setResponseFormat(): this;
  protected abstract setTemplateVariables(
    templateVariables: Record<string, any>[],
  ): this;

  build(): PromptBody {
    // order of method calls matters
    // as they set the properties of the prompt object
    // and some methods depend on others

    return this.setTone(this.prompt.tone)
      .setAudience(this.prompt.audience)
      .setTemperature(this.prompt.temperature)
      .setMaxTokens(this.prompt.maxTokens)
      .setTemplateVariables(this.prompt.templateVariables)

      .setMetadataTags(this.prompt.metadataTags)
      .setFallbackPromptKey(this.prompt.fallbackPromptKey)
      .setSystemPrompt()
      .setUserPrompt()
      .setExampleInput()
      .setExampleOutput()
      .setResponseFormat().prompt;
  }
}
