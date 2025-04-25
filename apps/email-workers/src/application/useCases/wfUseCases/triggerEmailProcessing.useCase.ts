import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ProcessEmailThreadWFPort } from '../../ports/outgoing/processEmailThreadWF.port';
import { TriggerEmailThreadProcessingWfCommand } from '../../ports/incoming/command';
import { WORKFLOW_SIGNALS } from '@common';

@CommandHandler(TriggerEmailThreadProcessingWfCommand)
export class TriggerEmailProcessingUseCase
  implements ICommandHandler<TriggerEmailThreadProcessingWfCommand>
{
  constructor(
    @Inject(ProcessEmailThreadWFPort)
    private readonly workflowTrigger: ProcessEmailThreadWFPort,
  ) {}

  async execute(command: TriggerEmailThreadProcessingWfCommand): Promise<void> {
    const { threadId, messageId } = command;

    await this.workflowTrigger.startEmailThreadWorkflow(
      threadId,
      messageId,
      WORKFLOW_SIGNALS.NEW_MESSAGE,
    );
  }
}
