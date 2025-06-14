import { Body, Controller, Get, Logger, Post, Param, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { threadId } from 'worker_threads';
import { ParseMessageIntentCommand } from '../../application/ports/incoming/commands/parse-message-intent.command';
import {
  ParseMessageIntentBodySchema,
  TMessageIntentResponseDTO,
} from '@common/dtos';
import { MessageIntentResponseMapper } from './mappers/messageIntentResponse.mapper';
import { schemaPipe } from '@schema-validation';
import { 
  GetRFQsQuery, 
  GetRFQMetricsQuery, 
  GetRFQByIdQuery, 
  GetProcessedEmailsQuery 
} from '../../application/ports/incoming/query';

@Controller('core-service')
export class CoreServiceController {
  private readonly logger = new Logger(CoreServiceController.name);
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

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

  // New RFQ management endpoints for frontend integration
  @Get('rfqs')
  async getRFQs(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    this.logger.log('GET /rfqs', { page, pageSize, status, search });
    
    const query = new GetRFQsQuery(
      Number(page),
      Number(pageSize),
      status,
      search
    );
    
    return await this.queryBus.execute(query);
  }

  @Get('rfqs/metrics')
  async getRFQMetrics() {
    this.logger.log('GET /rfqs/metrics');
    
    const query = new GetRFQMetricsQuery();
    return await this.queryBus.execute(query);
  }

  @Get('rfqs/:id')
  async getRFQById(@Param('id') id: string) {
    this.logger.log('GET /rfqs/:id', { id });
    
    const query = new GetRFQByIdQuery(id);
    return await this.queryBus.execute(query);
  }

  // Endpoint to get processed emails in format expected by frontend
  @Get('emails/processed')
  async getProcessedEmails() {
    this.logger.log('GET /emails/processed');
    
    const query = new GetProcessedEmailsQuery();
    return await this.queryBus.execute(query);
  }
}
