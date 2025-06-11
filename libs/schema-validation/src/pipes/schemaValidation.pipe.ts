import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { z } from 'zod';
import { SchemaValidationException } from '../exceptions';

@Injectable()
export class SchemaValidationPipe<T = any> implements PipeTransform<any, T> {
  constructor(
    private readonly schema: z.ZodSchema<T>,
    private readonly validationType?: string,
    private readonly options?: {
      errorMessage?: string;
      transform?: boolean;
      stripUnknown?: boolean;
    },
  ) {}

  transform(value: any, metadata: ArgumentMetadata): T {
    try {
      const result = this.schema.safeParse(value);

      if (!result.success) {
        throw new SchemaValidationException(
          result.error,
          this.validationType || metadata.type || 'input',
        );
      }

      return this.options?.transform ? result.data : value;
    } catch (error) {
      if (error instanceof SchemaValidationException) {
        throw error;
      }

      throw new BadRequestException(
        this.options?.errorMessage ||
          `Validation failed for ${this.validationType || metadata.type || 'input'}`,
      );
    }
  }
}
