import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SendEmailCommand } from '../../ports/incoming/command/sendEmail.command';
import { EmailClientFactoryPort } from '../../ports/outgoing/emailClient.port';

@CommandHandler(SendEmailCommand)
export class SendEmailUseCase implements ICommandHandler<SendEmailCommand> {
  private readonly logger = new Logger(SendEmailUseCase.name);

  constructor(
    private readonly emailClientFactory: EmailClientFactoryPort,
  ) {}

  async execute(command: SendEmailCommand): Promise<void> {
    const { to, subject, body, from } = command;

    this.logger.log(`📤 Sending email to: ${to}, subject: ${subject}`);

    try {
      const client = this.emailClientFactory.getClient('GMAIL');
      
      await (client as any).sendEmail({
        to,
        subject,
        body,
        from,
      });

      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }
} 