import { EventInboxAggregate } from '../../../../domain/entities/eventInboxAggregate';
import { EventInbox } from '../schemas/eventInbox.schema';

export class EventInboxMapper {
  static toPersistence(eventInbox: EventInboxAggregate): EventInbox {
    return {
      messageID: eventInbox.getMessageId(),
      status: eventInbox.getStatus(),
      eventHash: eventInbox.getEventHash(),
      source: eventInbox.getSource(),
      processedAt: eventInbox.getProcessedAt(),
      expiresAt: eventInbox.getExpiresAt(),
      metadata: eventInbox.getMetadata(),
    };
  }

  static toDomain(eventInbox: EventInbox): EventInboxAggregate {
    return EventInboxAggregate.fromPrimitives({
      messageId: eventInbox.messageID,
      status: eventInbox.status,
      eventHash: eventInbox.eventHash,
      source: eventInbox.source,
      processedAt: eventInbox.processedAt,
      expiresAt: eventInbox.expiresAt,
      metadata: eventInbox.metadata || {},
    });
  }
}
