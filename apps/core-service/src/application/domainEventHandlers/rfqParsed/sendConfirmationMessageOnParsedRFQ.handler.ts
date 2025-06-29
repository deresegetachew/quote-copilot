import { EventsHandler } from '@nestjs/cqrs';
import { RFQParsedDomainEvt } from '../../../domain/events';
import { ClientProxy } from '@nestjs/microservices';
import { Inject, Logger } from '@nestjs/common';
import { INTEGRATION_EVENT_CLIENT } from '@common';

@EventsHandler(RFQParsedDomainEvt)
export class sendConfirmationEmailOnParsedRFQHandler {
  private logger = new Logger(sendConfirmationEmailOnParsedRFQHandler.name);

  constructor(
    @Inject(INTEGRATION_EVENT_CLIENT) private readonly natsClient: ClientProxy,
  ) {}

  async handle(event: RFQParsedDomainEvt): Promise<void> {
    try {
      this.logger.debug(
        `RFQ parsed for thread ID: ${event.threadId}`,
        event.rfq,
      );

      // build confirmation email payload and send it to  email-workers service
      // postRFQParsedUseCase

      await this.natsClient.emit(
        rfqConfirmationEmailRequestedSubject,
        confirmationEmailPayload,
      );
    } catch (error) {
      console.error('Error handling RFQParsedEvent:', error);
    }
  }
}
