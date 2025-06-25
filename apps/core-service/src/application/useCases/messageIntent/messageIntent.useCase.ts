import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ParseMessageIntentCommand,
  ParseMessageIntentCommandSchema,
} from '../../ports/incoming/commands/parse-message-intent.command';
import { EmailWorkersClient } from '@common/clients/http';
import { DateTime } from 'luxon';
import { ParseEmailIntentGraph } from '@tools-langchain';
import { Logger } from '@nestjs/common';
import { RfqRepositoryPort } from '../../ports/outgoing/rfqRepository.port';
import { RFQFactory } from '../../../domain/factories/rfq.factories';
import { TEmailIntentResponseDTO } from '@common/dtos';
import { ValidateCommandSchema } from '@schema-validation';
import { AttachmentParsingStatus } from '@common/valueObjects';
import { DomainEventsPublisher } from '@common/eventPublishers/domainEventPublisher';

@CommandHandler(ParseMessageIntentCommand)
@ValidateCommandSchema(ParseMessageIntentCommandSchema)
export class MessageIntentUseCase
  implements ICommandHandler<ParseMessageIntentCommand, TEmailIntentResponseDTO>
{
  private readonly logger = new Logger(MessageIntentUseCase.name);

  constructor(
    private readonly emailWorkerClient: EmailWorkersClient,
    private readonly parseEmailIntentLLMGraph: ParseEmailIntentGraph,
    private readonly rfqRepository: RfqRepositoryPort,
    private readonly domainEventsPublisher: DomainEventsPublisher, // Assuming you have a domain event publisher
  ) {}

  async execute(
    command: ParseMessageIntentCommand,
  ): Promise<TEmailIntentResponseDTO> {
    const { threadId, messageId } = command.payload;

    try {
      // Call the email worker client to parse the message intent
      const threadMessages =
        await this.emailWorkerClient.getEmailThreadMessages(threadId);

      this.logger.debug(
        `Retrieved ${threadMessages.emails.length} messages for thread ${threadId}`,
      );

      // Log each message for debugging
      threadMessages.emails.forEach((msg, index) => {
        this.logger.debug(
          `Message ${index + 1} (${msg.messageId}): From ${msg.from}, Subject: "${msg.subject}"`,
        );
      });

      // Sort messages chronologically
      const sortedMessages = threadMessages.emails
        .sort(
          (a, b) =>
            DateTime.fromJSDate(a.receivedAt).toMillis() -
            DateTime.fromJSDate(b.receivedAt).toMillis(),
        )
        .map(
          (msg) =>
            `From: ${msg.from}\nTo: ${msg.to}\nSubject: ${msg.subject}\nDate: ${msg.receivedAt}\nBody: ${msg.body}`,
        );

      const sender = threadMessages.emails
        .map((email) => email.from)
        .join(', ');
      const attachments = threadMessages.attachments;
      const attPendingParse = attachments.filter(
        (att) => att.status === AttachmentParsingStatus.PENDING_PARSING,
      );

      // Parse the email intent using LLM
      const emailIntentResp =
        await this.parseEmailIntentLLMGraph.parseEmailWithLLM(
          threadId,
          sender,
          sortedMessages,
        );

      this.logger.log('🤖 parsed LLM Response:', {
        threadId: emailIntentResp.storageThreadID,
        isRFQ: emailIntentResp.isRFQ,
        reason: emailIntentResp.reason,
      });

      if (emailIntentResp.isRFQ) {
        this.logger.log(
          `📩 RFQ detected in thread ${emailIntentResp.storageThreadID}. Reason: ${emailIntentResp.reason}`,
        );

        const existingRFQ = await this.rfqRepository.findByThreadId(
          emailIntentResp.storageThreadID,
        );

        const rfq = RFQFactory.CUFromEmailIntentDTO(
          emailIntentResp,
          existingRFQ || undefined,
        );

        // TODO: Transaction begins here

        await this.rfqRepository.save(rfq);

        await this.domainEventsPublisher.publishAll([rfq]);

        this.logger.log(
          `RFQ ${existingRFQ != null ? 'updated' : 'created'} successfully for thread: ${emailIntentResp.storageThreadID}`,
        );

        // TODO: Transaction ends here
      }

      return emailIntentResp;
    } catch (error) {
      console.error('Error parsing message intent:', error);
      throw error; // Re-throw the error for further handling
    }
  }
}
