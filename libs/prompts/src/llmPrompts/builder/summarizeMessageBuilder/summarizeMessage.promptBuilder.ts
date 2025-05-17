import { Injectable, Logger, Scope } from '@nestjs/common';
import { AbstractPromptBuilder } from '../../../promptBuilder.abstract';
import { TSummarizeMessageInput } from './summarizeMessage.schema';

@Injectable({ scope: Scope.TRANSIENT })
export class SummarizeMessagePromptBuilder extends AbstractPromptBuilder<TSummarizeMessageInput> {
  logger = new Logger(SummarizeMessagePromptBuilder.name);

  protected setTemplateFolderPath(): this {
    this.templateFolder = 'summarizeMessage';

    this.logger.log('Template folder path:', {
      templateFolder: this.templateFolder,
    });

    return this;
  }

  protected setTemperature(): this {
    this.prompt.temperature = 0.7;
    return this;
  }

  protected setTone(): this {
    this.prompt.tone = 'neutral';
    return this;
  }

  protected setAudience(): this {
    this.prompt.audience = 'general';
    return this;
  }

  protected setTemplateVariables(): this {
    this.prompt.templateVariables = {
      ...this.context,
    };

    return this;
  }

  protected setMaxTokens(): this {
    this.prompt.maxTokens = 1024;
    return this;
  }
}
