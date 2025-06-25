import { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { ParseAttachmentCommand } from '../../ports/incoming/commands/parseAttachment.command';
import { Logger } from '@nestjs/common';
import { EmailWorkersClient } from '@common/clients/http';
import { DocumentParserClientPort } from '../../ports/outgoing/documentParserClient/documentParserClient.port';
import { parse } from 'path';
import { DocumentParserClientFactoryPort } from '../../ports/outgoing/documentParserClient/documentParserClientFactory.port';

export class ParseAttachmentUseCase
  implements ICommandHandler<ParseAttachmentCommand, void>
{
  private readonly logger = new Logger(ParseAttachmentUseCase.name);

  constructor(
    private readonly parseDocClientFactory: DocumentParserClientFactoryPort,
  ) {}

  execute(command: ParseAttachmentCommand): Promise<void> {
    this.logger.debug(`Parsing attachment`, {
      attachment: command,
    });
    return Promise.resolve();
  }
}
