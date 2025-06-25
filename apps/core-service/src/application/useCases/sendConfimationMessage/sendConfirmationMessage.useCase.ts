import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ValidateCommandSchema } from '@schema-validation';
import {
  SendConfirmationMessageCommand,
  SendConfirmationMessageCommandSchema,
} from '../../ports/incoming/commands/sendConfirmationMessage.command';

@CommandHandler(SendConfirmationMessageCommand)
@ValidateCommandSchema(SendConfirmationMessageCommandSchema)
export class SendConfirmationMessageUseCase
  implements ICommandHandler<SendConfirmationMessageCommand, void>
{
  private readonly logger = new Logger(SendConfirmationMessageUseCase.name);

  async execute(command: SendConfirmationMessageCommand): Promise<void> {
    const { threadId, rfq } = command;

    this.logger.debug(
      `Sending confirmation message for thread ID: ${threadId}`,
      { rfq },
    );

    // Generate email content using template service
    // const emailContent = await this.generateEmailContent(
    //   emailType as EmailType,
    //   customerName,
    //   rfqSummary,
    //   items,
    // );
  }
}
