import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ParseMessageIntentCommand } from '../../ports/incoming/commands/parse-message-intent.command';
import { EmailWorkersClient } from '@common/clients/http';
import { MessageIntentResponseDTO } from '@common/dtos';
import { DateTime } from 'luxon';
import {
  ParseEmailIntentGraph,
  TEmailIntentSchemaType,
} from '@tools-langchain';
import { Injectable, Logger } from '@nestjs/common';
import { MessageIntentResponseMapper } from '../../../presenters/http/mappers/messageIntentResponse.mapper';
import { RfqRepositoryPort } from '../../ports/outgoing/rfqRepository.port';
import { RfqFactory } from '../../../domain/factories/rfq.factories';

@CommandHandler(ParseMessageIntentCommand)
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

      const llmResponse = await this.parseEmailIntentLLMGraph.parseEmailWithLLM(
        threadId,
        sender,
        messages,
      );

      this.logger.log('🤖 parsed LLM Response:', {
        threadId: llmResponse.threadId,
        isRFQ: llmResponse.isRFQ,
        reason: llmResponse.reason,
      });

      if (llmResponse.isRFQ) {
        this.logger.log(
          `📩 RFQ detected in thread ${llmResponse.threadId}. Reason: ${llmResponse.reason}`,
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
