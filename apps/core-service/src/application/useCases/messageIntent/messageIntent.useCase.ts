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
import { Logger } from '@nestjs/common';
import { RfqRepositoryPort } from '../../ports/outgoing/rfqRepository.port';
import { RfqFactory } from '../../../domain/factories/rfq.factories';
import { AttachmentParsingStatus } from '../../../../../../libs/common/src';
import { ValidateCommandSchema } from '@schema-validation';

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
  ) {}

  async execute(
    command: ParseMessageIntentCommand,
  ): Promise<TEmailIntentSchemaType> {
    const { threadId, messageId } = command.payload;

    try {
      // Call the email worker client to parse the message intent
      const result =
        await this.emailWorkerClient.getEmailThreadMessages(threadId);

      const messages = result.emails
        .sort(
          (a, b) =>
            DateTime.fromISO(a.receivedAt).toMillis() -
            DateTime.fromISO(b.receivedAt).toMillis(),
        )
        .map((email) => email.body);

      const sender = result.emails.map((email) => email.from).join(', ');
      const attachments = result.attachments;
      const attPendingParse = attachments.filter(
        (att) => att.status === AttachmentParsingStatus.PENDING_PARSING,
      );

      const llmResponse = await this.parseEmailIntentLLMGraph.parseEmailWithLLM(
        threadId,
        sender,
        messages,
      );

      this.logger.log('🤖 parsed LLM Response:', {
        threadId: llmResponse.storageThreadID,
        isRFQ: llmResponse.isRFQ,
        reason: llmResponse.reason,
      });

      if (llmResponse.isRFQ) {
        this.logger.log(
          `📩 RFQ detected in thread ${llmResponse.storageThreadID}. Reason: ${llmResponse.reason}`,
        );

        const newRFQ = RfqFactory.crateFromEmailIntentResponse(llmResponse);

        await this.rfqRepository.save(newRFQ);

        // Temporary do it here
        // send confirmation email to the user
        // save RFQ Details to the database
      }

      return llmResponse;
    } catch (error) {
      console.error('Error parsing message intent:', error);
      throw error; // Re-throw the error for further handling
    }
  }
}
