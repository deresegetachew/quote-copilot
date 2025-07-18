import { InternalServerErrorException } from '@nestjs/common';

export class EventLockedException extends InternalServerErrorException {
  constructor(
    eventID: string,
    message: string = 'Event is locked and cannot be processed.',
  ) {
    message = `Event with ID ${eventID} is locked: ${message}`;
    super(message);
  }
}
