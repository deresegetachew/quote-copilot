import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { threadId } from 'worker_threads';
import { ParseMessageIntentCommand } from '../../application/ports/incoming/commands/parse-message-intent.command';
import { MessageIntentResponseDTO } from '@common';
import { MessageIntentResponseMapper } from './mappers/messageIntentResponse.mapper';

@Controller('core-service')
export class CoreServiceController {
  private readonly logger = new Logger(CoreServiceController.name);
  constructor(private readonly commandBus: CommandBus) {}

  @Get()
  getStatus(): string {
    return 'Core Service is running';
  }

  @Post('parse-message-intent')
  async parseEmailIntentEndpoint(
    @Body() param,
  ): Promise<MessageIntentResponseDTO> {
    this.logger.log('/parse-message-intent', param);
    const { threadId, messageId } = param;
    const result = await this.commandBus.execute(
      new ParseMessageIntentCommand({
        threadId,
        messageId,
      }),
    );
    return MessageIntentResponseMapper.toResponse({ llmResponse: result });
  }
}
