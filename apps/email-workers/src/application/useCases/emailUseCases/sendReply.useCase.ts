import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SendReplyCommand } from '../../ports/incoming/command/sendReply.command';
import { EmailClientFactoryPort } from '../../ports/outgoing/emailClient.port';

@CommandHandler(SendReplyCommand)
export class SendReplyUseCase implements ICommandHandler<SendReplyCommand> {
  private readonly logger = new Logger(SendReplyUseCase.name);

  constructor(
    private readonly emailClientFactory: EmailClientFactoryPort,
  ) {}

  async execute(command: SendReplyCommand): Promise<void> {
    const { to, subject, body, threadId, inReplyTo, references, from } = command;

    this.logger.log(`Sending reply to: ${to}, thread: ${threadId}, subject: ${subject}`);

    try {
      const client = this.emailClientFactory.getClient('GMAIL');
      
      await (client as any).sendReply({
        to,
        subject,
        body,
        threadId,
        inReplyTo,
        references,
        from,
      });

      this.logger.log(`Reply sent successfully to ${to} in thread ${threadId}`);
    } catch (error) {
      this.logger.error(`Failed to send reply to ${to}: ${error.message}`);
      throw error;
    }
  }
} 