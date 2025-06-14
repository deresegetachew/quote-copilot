import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { RfqConfirmationEmailRequested } from '@common/integrationEvents';
import { rfqConfirmationEmailRequestedSubject, TRfqConfirmationEmailRequestedPayload } from '@common/nats';
import { SendRfqConfirmationEmailCommand } from '../ports/incoming/command/sendRfqConfirmationEmail.command';

@Controller()
export class RfqConfirmationEmailRequestedHandler {
  private readonly logger = new Logger(RfqConfirmationEmailRequestedHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern(rfqConfirmationEmailRequestedSubject)
  async handleEvent(@Payload() data: TRfqConfirmationEmailRequestedPayload) {
    this.logger.log(`Received RFQ confirmation email request for thread: ${data.threadId}`);

    try {
      await this.commandBus.execute(
        new SendRfqConfirmationEmailCommand(
          data.threadId,
          data.recipientEmail,
          data.customerName,
          data.rfqSummary,
          null,
          data.emailType,
          data.originalSubject,
          data.originalMessageId,
          data.references,
        )
      );

      this.logger.log(`RFQ confirmation email sent successfully for thread: ${data.threadId}`);
    } catch (error) {
      this.logger.error(`Failed to send RFQ confirmation email for thread ${data.threadId}: ${error.message}`, error.stack);
      throw error;
    }
  }
} 