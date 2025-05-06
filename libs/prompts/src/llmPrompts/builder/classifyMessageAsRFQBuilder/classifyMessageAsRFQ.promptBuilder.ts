import { Injectable, Logger, Scope } from '@nestjs/common';
import { AbstractPromptBuilder } from '../../../promptBuilder.abstract';
import { TClassifyMessageAsRFQInput } from './classifyMessageAsRFQ.schema';

@Injectable({ scope: Scope.TRANSIENT })
export class ClassifyMessageAsRFQPromptBuilder extends AbstractPromptBuilder<TClassifyMessageAsRFQInput> {
  logger = new Logger(ClassifyMessageAsRFQPromptBuilder.name);

  protected setTemplateFolderPath(): this {
    this.templateFolder = 'classifyMessageAsRFQ';

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
      ...this.context,
    };

    return this;
  }

  protected setMaxTokens(): this {
    this.prompt.maxTokens = 512;
    return this;
  }
}
