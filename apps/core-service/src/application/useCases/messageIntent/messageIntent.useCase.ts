import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ParseMessageIntentCommand,
  ParseMessageIntentCommandSchema,
} from '../../ports/incoming/commands/parse-message-intent.command';
import { EmailWorkersClient } from '@common/clients/http';
import { DateTime } from 'luxon';
import {
  ParseEmailIntentGraph,
  TEmailIntentSchemaType,
} from '@tools-langchain';
import { Inject, Logger } from '@nestjs/common';
import { RfqRepositoryPort } from '../../ports/outgoing/rfqRepository.port';
import { RfqFactory } from '../../../domain/factories/rfq.factories';
import { AttachmentParsingStatus } from '../../../../../../libs/common/src';
import { ValidateCommandSchema } from '@schema-validation';
import { RFQEntity } from '../../../domain/entities/RFQ.entity';
import { EMAIL_ENUMS, NATS_SERVICE } from '@common';
import { ClientProxy } from '@nestjs/microservices';
import { 
  rfqConfirmationEmailRequestedSubject, 
  TRfqConfirmationEmailRequestedPayload 
} from '@common/nats';

@CommandHandler(ParseMessageIntentCommand)
@ValidateCommandSchema(ParseMessageIntentCommandSchema)
export class MessageIntentUseCase
  implements ICommandHandler<ParseMessageIntentCommand, TEmailIntentSchemaType>
{
  private readonly logger = new Logger(MessageIntentUseCase.name);

  constructor(
    private readonly emailWorkerClient: EmailWorkersClient,
    private readonly parseEmailIntentLLMGraph: ParseEmailIntentGraph,
    private readonly rfqRepository: RfqRepositoryPort,
    @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy,
  ) {}

  async execute(
    command: ParseMessageIntentCommand,
  ): Promise<TEmailIntentSchemaType> {
    const { threadId, messageId } = command.payload;

    try {
      this.logger.log(
        `Processing message intent for thread: ${threadId}, message: ${messageId}`,
      );

      // Get all messages in the thread for context
      const threadMessages = await this.emailWorkerClient.getEmailThreadMessages(threadId);
      
      this.logger.log(
        `Retrieved ${threadMessages.emails.length} messages for thread ${threadId}`,
      );

      // Log each message for debugging
      threadMessages.emails.forEach((msg, index) => {
        this.logger.log(
          `Message ${index + 1} (${msg.messageId}): From ${msg.from}, Subject: "${msg.subject}"`,
        );
      });

      // Sort messages chronologically
      const sortedMessages = threadMessages.emails
        .sort((a, b) => 
          DateTime.fromJSDate(a.receivedAt).toMillis() - 
          DateTime.fromJSDate(b.receivedAt).toMillis()
        )
        .map(msg => 
          `From: ${msg.from}\nTo: ${msg.to}\nSubject: ${msg.subject}\nDate: ${msg.receivedAt}\nBody: ${msg.body}`
        );

      // Get sender info from threadMessages
      const sender = threadMessages.emails.map((email) => email.from).join(', ');
      const attachments = threadMessages.attachments;
      const attPendingParse = attachments.filter(
        (att) => att.status === AttachmentParsingStatus.PENDING_PARSING,
      );

      // Parse the email intent using LLM
      const llmResponse = await this.parseEmailIntentLLMGraph.parseEmailWithLLM(
        threadId,
        sender,
        sortedMessages,
      );

      this.logger.log(
        `LLM Response: isRFQ=${llmResponse.isRFQ}, reason="${llmResponse.reason}"`,
      );

      // Get original email details for confirmation email threading
      const originalMessage = threadMessages.emails[0]; // First message in thread
      const senderEmail = originalMessage.from;
      const originalSubject = originalMessage.subject;
      const originalMessageId = originalMessage.messageId;

      if (llmResponse.isRFQ) {
        this.logger.log(
          `RFQ detected in thread ${llmResponse.threadId}. Reason: ${llmResponse.reason}`,
        );

        // Check if this is a new RFQ or follow-up to existing one
        const existingRfq = await this.rfqRepository.findByThreadId(threadId);
        const isNewRfq = !existingRfq;

        let rfqToSave: RFQEntity;
        
        if (isNewRfq) {
          // Create a new RFQ for first-time requests
          this.logger.log(`Creating NEW RFQ for thread ${threadId}`);
          rfqToSave = RfqFactory.crateFromEmailIntentResponse(llmResponse);
        } else {
          // Update existing RFQ for follow-up requests
          this.logger.log(`Updating EXISTING RFQ (ID: ${existingRfq.getStorageId()}) for follow-up in thread ${threadId}`);
          this.logger.log(`Original RFQ status: ${existingRfq.getStatus().getValue()}`);
          
          rfqToSave = RfqFactory.updateExistingFromEmailIntentResponse(
            existingRfq,
            llmResponse,
          );
          
          this.logger.log(`Updated RFQ status: ${rfqToSave.getStatus().getValue()}`);
          this.logger.log(`RFQ has ${rfqToSave.getItems().length} items after follow-up processing`);
        }

        await this.rfqRepository.save(rfqToSave);

        // Fire NATS event for confirmation email instead of sending directly
        const emailType = isNewRfq 
          ? EMAIL_ENUMS.RFQ_NEW_CONFIRMATION 
          : EMAIL_ENUMS.RFQ_FOLLOWUP_CONFIRMATION;

        const confirmationEmailPayload: TRfqConfirmationEmailRequestedPayload = {
          threadId,
          rfqId: rfqToSave.getStorageId(),
          recipientEmail: senderEmail,
          customerName: llmResponse.customerDetail?.name || null,
          rfqSummary: llmResponse.requestSummary || null,
          items: llmResponse.items || null,
          emailType,
          originalSubject,
          originalMessageId,
          references: originalMessageId,
        };

        try {
          this.logger.log(
            `Firing NATS event for ${emailType} confirmation email to ${senderEmail} for thread ${threadId}`,
          );

          await this.natsClient.emit(rfqConfirmationEmailRequestedSubject, confirmationEmailPayload);

          this.logger.log(
            `${isNewRfq ? 'New RFQ' : 'Follow-up'} confirmation email event fired successfully for thread ${threadId}`,
          );
        } catch (eventError) {
          this.logger.error(
            `Failed to fire RFQ confirmation email event: ${eventError.message}`,
          );
          // Don't throw - we don't want event failure to break RFQ processing
        }
      }

      return llmResponse;
    } catch (error) {
      console.error('Error parsing message intent:', error);
      throw error; // Re-throw the error for further handling
    }
  }
}
