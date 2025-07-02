import { EventsHandler } from '@nestjs/cqrs';
import { RFQParsedDomainEvt } from '../../../domain/events';
import { Logger } from '@nestjs/common';
import { EventPublisher } from '@common/eventPublishers';
import { RFQParsedIntegrationEvt } from '@common/events';

@EventsHandler(RFQParsedDomainEvt)
export class NotifyBackOfficeOnParsedRFQHandler {
  private logger = new Logger(NotifyBackOfficeOnParsedRFQHandler.name);

  constructor(private readonly eventPublisher: EventPublisher) {}

  async handle(event: RFQParsedDomainEvt): Promise<void> {
    try {
      this.logger.log(`Notifying back office on ${event.threadId} RFQ parsed`);

      const evt = new RFQParsedIntegrationEvt('core-service', {
        rfqId: event.rfq.getStorageId().getValue(),
      });

      this.eventPublisher.publish(evt, {});
    } catch (error) {
      console.error('Error handling RFQParsedEvent:', error);
    }
  }
}
