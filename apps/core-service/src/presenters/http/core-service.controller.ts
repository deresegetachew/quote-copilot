import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ParseMessageIntentCommand } from '../../application/ports/incoming/commands/parse-message-intent.command';
import {
  ParseMessageIntentBodySchema,
  TMessageIntentResponseDTO,
} from '@common/dtos';
import { MessageIntentResponseMapper } from './mappers/messageIntentResponse.mapper';
import { schemaPipe } from '@schema-validation';

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
    @Body(schemaPipe(ParseMessageIntentBodySchema)) data,
  ): Promise<TMessageIntentResponseDTO> {
    this.logger.log('/parse-message-intent', data);
    const { threadId, messageId } = data;
    const result = await this.commandBus.execute(
      new ParseMessageIntentCommand({
        threadId,
        messageId,
      }),
    );
    return MessageIntentResponseMapper.toResponse({ llmResponse: result });
  }
}
