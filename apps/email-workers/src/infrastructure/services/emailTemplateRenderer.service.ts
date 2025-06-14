import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';

export type EmailType = 'RFQ_NEW_CONFIRMATION' | 'RFQ_FOLLOWUP_CONFIRMATION';

export interface EmailTemplateData {
  greeting: string;
  rfqSummary?: string;
  itemsSection?: string;
}

@Injectable()
export class EmailTemplateRendererService {
  private readonly logger = new Logger(EmailTemplateRendererService.name);
  private readonly templatesPath: string;

  constructor() {
    this.templatesPath = path.join(process.cwd(), 'dist', 'apps', 'email-workers', 'templates', 'email');
  }

  async renderEmailTemplate(
    emailType: EmailType,
    data: EmailTemplateData,
  ): Promise<string> {
    try {
      const templateFileName = this.getTemplateFileName(emailType);
      const templatePath = path.join(this.templatesPath, templateFileName);
      
      this.logger.debug(`Rendering email template: ${templatePath}`);
      
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const compiled = Handlebars.compile(templateContent, { noEscape: true });
      
      return compiled(data);
    } catch (error) {
      this.logger.error(`Error rendering email template for ${emailType}:`, error);
      throw new Error(`Failed to render email template: ${error.message}`);
    }
  }

  private getTemplateFileName(emailType: EmailType): string {
    switch (emailType) {
      case 'RFQ_NEW_CONFIRMATION':
        return 'rfq-new-confirmation.hbs';
      case 'RFQ_FOLLOWUP_CONFIRMATION':
        return 'rfq-followup-confirmation.hbs';
      default:
        throw new Error(`Unknown email type: ${emailType}`);
    }
  }
} 