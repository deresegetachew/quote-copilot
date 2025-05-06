import { Injectable, Logger, Scope } from '@nestjs/common';
import { AbstractPromptBuilder } from '../../../promptBuilder.abstract';
import { TExtractRFQDetailsInput } from './extractRFQDetails.schema';

@Injectable({ scope: Scope.TRANSIENT })
export class ExtractRFQDetailsPromptBuilder extends AbstractPromptBuilder<TExtractRFQDetailsInput> {
  logger = new Logger(ExtractRFQDetailsPromptBuilder.name);

  protected setTemplateFolderPath(): this {
    this.templateFolder = 'extractRFQDetails';

    this.logger.log('Template folder path:', {
      templateFolder: this.templateFolder,
    });

    return this;
  }

  protected setTemperature(): this {
    this.prompt.temperature = 0.5;
    return this;
  }

  protected setTone(): this {
    this.prompt.tone = 'analytical';
    return this;
  }

  protected setAudience(): this {
    this.prompt.audience = 'classification system';
    return this;
  }

  protected setTemplateVariables(): this {
    this.prompt.templateVariables = {
      messages: this.context.messages,
      responseSchema: this.context.responseSchema,
    };

    return this;
  }

  protected setMaxTokens(): this {
    this.prompt.maxTokens = 512;
    return this;
  }
}
