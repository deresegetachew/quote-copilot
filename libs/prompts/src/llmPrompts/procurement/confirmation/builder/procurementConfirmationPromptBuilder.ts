import * as fs from 'fs';
import * as path from 'path';

import { Injectable, Scope } from '@nestjs/common';
import { AbstractPromptBuilder } from '../../../../promptBuilder.abstract';
import { renderTemplate } from '../../../../util/handleBars.helper';

@Injectable({ scope: Scope.TRANSIENT })
export class ProcurementConfirmationPromptBuilder extends AbstractPromptBuilder {
  protected setTemperature(): this {
    this.prompt.temperature = 0.5;
    return this;
  }

  protected setTone(): this {
    this.prompt.tone = 'professional';
    return this;
  }

  protected setAudience(): this {
    this.prompt.audience = 'procurement team';
    return this;
  }

  protected setTemplateVariables(): this {
    this.prompt.templateVariables = [{}];

    return this;
  }

  protected setDescription(): this {
    this.prompt.description = this.parseTemplate('description', {}) || '';
    return this;
  }

  protected setMaxTokens(): this {
    this.prompt.maxTokens = 2048;
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

  protected setExampleInput(): this {
    return this;
  }

  protected setExampleOutput(): this {
    this.prompt.exampleOutput = this.parseTemplate('exampleOutput', {});
    return this;
  }

  protected setResponseFormat(): this {
    this.prompt.responseFormat = this.parseTemplate('response', {});
    return this;
  }

  private parseTemplate(
    templateName: string,
    data: Record<string, any>,
  ): string {
    const templatePath = path.resolve(
      __dirname,
      'templates',
      'confirmation',
      `${templateName}.prompt.ejs`,
    );
    if (fs.existsSync(templatePath)) {
      return renderTemplate(templatePath, data);
    }
    return '';
  }
}
