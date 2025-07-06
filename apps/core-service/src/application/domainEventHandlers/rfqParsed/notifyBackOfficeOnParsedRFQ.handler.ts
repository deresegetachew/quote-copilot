import { CommandBus, EventsHandler } from '@nestjs/cqrs';
import { RFQParsedDomainEvt } from '../../../domain/events';
import { Logger } from '@nestjs/common';

@EventsHandler(RFQParsedDomainEvt)
export class NotifyBackOfficeOnParsedRFQHandler {
  private logger = new Logger(NotifyBackOfficeOnParsedRFQHandler.name);

  constructor() {}

  async handle(event: RFQParsedDomainEvt): Promise<void> {
    try {
      this.logger.debug(
        `RFQ parsed for thread ID: ${event.threadId}`,
        event.rfq,
      );

      this.logger.log(
        'Notifying back office about parsed RFQ not implemented yet',
      );
    } catch (error) {
      console.error('Error handling RFQParsedEvent:', error);
    }
  }
}
