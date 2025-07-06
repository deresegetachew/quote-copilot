import { EventsHandler, CommandBus } from '@nestjs/cqrs';
import { RFQParsedDomainEvt } from '../../../domain/events';
import { Logger } from '@nestjs/common';
import { SendConfirmationMessageCommand } from '../../ports/incoming/commands/sendConfirmationMessage.command';

@EventsHandler(RFQParsedDomainEvt)
export class sendConfirmationEmailOnParsedRFQHandler {
  private logger = new Logger(sendConfirmationEmailOnParsedRFQHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: RFQParsedDomainEvt): Promise<void> {
    try {
      this.logger.debug(
        `RFQ parsed for thread ID: ${event.threadId}`,
        event.rfq,
      );

      await this.commandBus.execute(
        new SendConfirmationMessageCommand(event.threadId, event.rfq),
      );
    } catch (error) {
      this.logger.error('Error handling RFQParsedEvent:', error);
    }
  }
}
