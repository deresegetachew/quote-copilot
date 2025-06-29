import { InternalServerErrorException } from '@nestjs/common';

export class PublishEventException extends InternalServerErrorException {
  constructor(
    message: string,
    public readonly err: Error,
  ) {
    super(err, message);
    this.name = 'PublishEventException';
  }
}
