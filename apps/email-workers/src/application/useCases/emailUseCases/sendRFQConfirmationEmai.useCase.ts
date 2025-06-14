import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SendRfqConfirmationEmailCommand } from '../../ports/incoming/command/sendRfqConfirmationEmail.command';
import { EmailClientFactoryPort } from '../../ports/outgoing/emailClient.port';
import { EmailTemplateRendererService, EmailTemplateData, EmailType } from '../../../infrastructure/services';

@CommandHandler(SendRfqConfirmationEmailCommand)
export class SendRfqConfirmationEmailUseCase implements ICommandHandler<SendRfqConfirmationEmailCommand> {
  private readonly logger = new Logger(SendRfqConfirmationEmailUseCase.name);

  constructor(
    private readonly emailClientFactory: EmailClientFactoryPort,
    private readonly emailTemplateRenderer: EmailTemplateRendererService,
  ) {}

  async execute(command: SendRfqConfirmationEmailCommand): Promise<void> {
    const { 
      threadId, 
      recipientEmail, 
      customerName, 
      rfqSummary, 
      items, 
      emailType,
      originalSubject,
      originalMessageId,
      references 
    } = command;

    // Generate email content using template service
    const emailContent = await this.generateEmailContent(
      emailType as EmailType,
      customerName,
      rfqSummary,
      items,
    );

    // Generate reply subject (add "Re: " if not already present)
    const replySubject = this.generateReplySubject(originalSubject || 'RFQ Request');

    this.logger.log(
      `Sending ${emailType} confirmation reply to ${recipientEmail} for thread ${threadId}`,
    );

    try {
      const client = this.emailClientFactory.getClient('GMAIL');
      
      // Always send as reply to maintain thread continuity
      await (client as any).sendReply({
        to: recipientEmail,
        subject: replySubject,
        body: emailContent,
        threadId,
        inReplyTo: originalMessageId,
        references,
      });

      this.logger.log(`RFQ confirmation reply sent successfully to ${recipientEmail} for thread ${threadId}`);
    } catch (error) {
      this.logger.error(`Failed to send RFQ confirmation reply: ${error.message}`, error.stack);
      throw error;
    }
  }

  private generateReplySubject(originalSubject: string): string {
    // Add "Re: " prefix if not already present
    if (originalSubject.toLowerCase().startsWith('re:')) {
      return originalSubject;
    }
    return `Re: ${originalSubject}`;
  }

  private async generateEmailContent(
    emailType: EmailType,
    customerName?: string | null,
    rfqSummary?: string | null,
    items?: Array<{
      itemCode: string;
      itemDescription: string | null;
      quantity: number;
      unit: string | null;
      notes: string[] | null;
    }> | null,
  ): Promise<string> {
    const greeting = customerName ? `Dear ${customerName},` : 'Dear Valued Customer,';
    const itemsSection = this.formatItemsForEmail(items);
    
    const templateData: EmailTemplateData = {
      greeting,
      rfqSummary: rfqSummary || undefined,
      itemsSection: itemsSection || undefined,
    };

    return await this.emailTemplateRenderer.renderEmailTemplate(emailType, templateData);
  }

  private formatItemsForEmail(
    items?: Array<{
      itemCode: string;
      itemDescription: string | null;
      quantity: number;
      unit: string | null;
      notes: string[] | null;
    }> | null,
  ): string {
    if (!items || items.length === 0) {
      return '';
    }

    if (items.length === 1) {
      const item = items[0];
      const itemCode = item.itemCode || 'N/A';
      const description = item.itemDescription ? ` - ${item.itemDescription}` : '';
      const quantity = item.quantity || 'N/A';
      const unit = item.unit ? ` ${item.unit}` : '';
      return `Requested Item: ${itemCode}${description} (Qty: ${quantity}${unit})\n`;
    }

    // Multiple items - create a formatted list
    const itemsList = items
      .map((item, index) => {
        const itemCode = item.itemCode || 'N/A';
        const description = item.itemDescription ? ` - ${item.itemDescription}` : '';
        const quantity = item.quantity || 'N/A';
        const unit = item.unit ? ` ${item.unit}` : '';
        return `  ${index + 1}. ${itemCode}${description} (Qty: ${quantity}${unit})`;
      })
      .join('\n');

    return `Requested Items (${items.length} items):\n${itemsList}\n`;
  }
}
