import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  EmailConfirmationPort, 
  SendRfqConfirmationEmailInput 
} from '../../application/ports/outgoing/emailConfirmation.port';
import { EMAIL_ENUMS, EmailConstants } from '@common';

@Injectable()
export class EmailConfirmationAdapter extends EmailConfirmationPort {
  private readonly logger = new Logger(EmailConfirmationAdapter.name);
  private readonly emailWorkersBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    super();
    // Get email workers URL from config
    this.emailWorkersBaseUrl = this.configService.get('apps.emailWorker.baseUrl') || 'http://localhost:3002';
  }

  async sendRfqConfirmationEmail(
    input: SendRfqConfirmationEmailInput,
  ): Promise<void> {
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
    } = input;

    // Get email template configuration
    const emailConfig = EmailConstants[emailType];

    // Generate reply subject (add "Re: " if not already present)
    const replySubject = this.generateReplySubject(originalSubject || emailConfig.subject);

    this.logger.log(
      `📧 Sending ${emailType} confirmation reply to ${recipientEmail} for thread ${threadId}`,
    );

    try {
      // Send data to email-workers service for template rendering and sending
      await this.sendConfirmationEmail({
        to: recipientEmail,
        subject: replySubject,
        threadId,
        originalMessageId,
        references,
        customerName,
        rfqSummary,
        items,
        emailType,
      });

      this.logger.log(`RFQ confirmation reply sent successfully to ${recipientEmail} for thread ${threadId}`);
    } catch (error) {
      this.logger.error(`Failed to send RFQ confirmation reply: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async sendConfirmationEmail(confirmationData: {
    to: string;
    subject: string;
    threadId: string;
    originalMessageId?: string;
    references?: string;
    customerName?: string;
    rfqSummary?: string;
    items?: Array<{
      itemCode?: string;
      itemDescription?: string | null;
      quantity?: number;
      unit?: string | null;
      notes?: string[] | null;
    }>;
    emailType: EMAIL_ENUMS.RFQ_NEW_CONFIRMATION | EMAIL_ENUMS.RFQ_FOLLOWUP_CONFIRMATION;
  }): Promise<void> {
    const response = await fetch(`${this.emailWorkersBaseUrl}/email-workers/send-rfq-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: confirmationData.to,
        subject: confirmationData.subject,
        threadId: confirmationData.threadId,
        inReplyTo: confirmationData.originalMessageId,
        references: confirmationData.references,
        customerName: confirmationData.customerName,
        rfqSummary: confirmationData.rfqSummary,
        items: confirmationData.items,
        emailType: confirmationData.emailType,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send confirmation email: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(`Confirmation email sending failed: ${result.message}`);
    }
  }

  private generateReplySubject(originalSubject: string): string {
    // Add "Re: " prefix if not already present
    if (originalSubject.toLowerCase().startsWith('re:')) {
      return originalSubject;
    }
    return `Re: ${originalSubject}`;
  }
} 