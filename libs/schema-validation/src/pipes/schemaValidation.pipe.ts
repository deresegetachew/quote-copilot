import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationException } from '../exceptions';

@Injectable()
export class SchemaValidationPipe implements PipeTransform {
  constructor(
    private readonly schema: z.ZodSchema<any>,
    private readonly validationType: string = 'input',
    private readonly options?: {
      errorMessage?: string;
      transform?: boolean;
      stripUnknown?: boolean;
    },
  ) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      // Use safeParse without custom options for now
      const result = this.schema.safeParse(value);

      if (!result.success) {
        throw new ZodValidationException(result.error, this.validationType);
      }

      return this.options?.transform ? result.data : value;
    } catch (error) {
      if (error instanceof ZodValidationException) {
        throw error;
      }

      throw new BadRequestException(
        this.options?.errorMessage ||
          `Validation failed for ${this.validationType}`,
      );
    }
  }
}
