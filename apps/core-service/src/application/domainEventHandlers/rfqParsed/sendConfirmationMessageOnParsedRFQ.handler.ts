import { CommandBus, EventsHandler } from '@nestjs/cqrs';
import { RFQParsedEvent } from '../../../domain/events';
import { ClientProvider, ClientProxy } from '@nestjs/microservices';

@EventsHandler(RFQParsedEvent)
export class sendConfirmationEmailOnParsedRFQHandler {
  constructor(private readonly natsClient: ClientProxy) {}

  async handle(event: RFQParsedEvent): Promise<void> {
    try {
      console.log(`RFQ parsed for thread ID: ${event.threadId}`, event.rfq);

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
