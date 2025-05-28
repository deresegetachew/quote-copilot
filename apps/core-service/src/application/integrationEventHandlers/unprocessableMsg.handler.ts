import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { UnprocessableMessageParsed } from '@common/integrationEvents';

@Controller()
export class UnprocessableMsgHandler {
  logger = new Logger(UnprocessableMsgHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern(UnprocessableMessageParsed)
  async handleEvent(@Payload() data: any) {
    this.logger.log('Unprocessable message received: ', data);

    // await this.commandBus.execute(new ProcessRFQCommand());

    //   lets implement the happy path for now.

    // fire command to a usecase
    // save email thread details, summmary and request details to RFQ table
    // if already existing , update the summary and request details
    // if not existing, create a new RFQ
    // fire an event to send email to the customer we received the RFQ, this event will be handled by the email worker as workflow
    // check inventory to process the RFQ. use the repoisotry, that can check 100 sources we dont care
    // if enough inventory, send message to email thread workflow prepare a quote to the customer
    // when that is done, maybe we need human in the loop based on the product / quote amount
    // fire sendQuote event activity

    // if not enough inventory, maybe create an entry in  RFQ to supplier table and then fire workflow to check with supplier
  }
}
