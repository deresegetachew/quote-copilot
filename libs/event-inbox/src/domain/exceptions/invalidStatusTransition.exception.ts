import { InternalServerErrorException } from '@nestjs/common';

export class InvalidStatusTransitionException extends InternalServerErrorException {
  constructor(
    public readonly currentStatus: string,
    public readonly targetStatus: string,
  ) {
    super(`Invalid status transition from ${currentStatus} to ${targetStatus}`);
  }
}
