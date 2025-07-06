import { EventsHandler } from '@nestjs/cqrs';
import { RFQAttachmentsFoundDomainEvt } from '../../../domain/events';
import { Inject, Logger } from '@nestjs/common';
import { AttachmentParsingRequestedEvt } from '@common/events';
import { EventPublisher } from '@common/eventPublishers';
import { INTEGRATION_EVENT_CLIENT } from '@common/constants';

@EventsHandler(RFQAttachmentsFoundDomainEvt)
export class RFQAttachmentsParsingRequestedHandler {
  private logger = new Logger(RFQAttachmentsParsingRequestedHandler.name);
  constructor(
    @Inject(INTEGRATION_EVENT_CLIENT)
    private readonly eventBusClient: EventPublisher,
  ) {}

  async handle(event: RFQAttachmentsFoundDomainEvt): Promise<void> {
    try {
      const evt = new AttachmentParsingRequestedEvt('core-service', {
        threadId: event.threadId,
      });

      // Emit the integration event to the message broker
      this.eventBusClient.publish(evt, {});

      this.logger.log(`RFQ attachments parsing requested : ${event}`);
    } catch (error) {
      this.logger.error(
        `Error handling RFQAttachmentsParsingRequestedEvent for thread ID: ${event.threadId}`,
        error,
      );
    }
  }
}
