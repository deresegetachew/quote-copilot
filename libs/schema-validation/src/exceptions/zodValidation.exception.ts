import { HttpException, HttpStatus } from '@nestjs/common';
import { z } from 'zod';

export class ZodValidationException extends HttpException {
  constructor(
    public readonly zodError: z.ZodError,
    public readonly validationType: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    const message = `Validation failed for ${validationType}`;
    super(
      {
        message,
        errors: zodError.errors.map((error) => ({
          path: error.path.join('.'),
          message: error.message,
          code: error.code,
        })),
        statusCode: status,
      },
      status,
    );
  }
}
