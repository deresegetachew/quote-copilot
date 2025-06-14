import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { UnreadEmailMessageAppendedEvent } from '../../domain/events/unreadEmailMessageAppended.event';
import { TriggerEmailThreadProcessingWfCommand } from '../ports/incoming/command';

@EventsHandler(UnreadEmailMessageAppendedEvent)
export class TriggerWorkflowOnUnreadEmails
  implements IEventHandler<UnreadEmailMessageAppendedEvent>
{
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: UnreadEmailMessageAppendedEvent) {
    try {
      const email = event.newMessage;
      await this.commandBus.execute(
        new TriggerEmailThreadProcessingWfCommand(
          event.threadId,
          email.getMessageId(),
        ),
      );
    } catch (error) {
      console.error('Error triggering workflow on unread emails:', error);
    }
  }
}
