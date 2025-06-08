import { z } from 'zod';
import {
  ValidationOptions,
  ValidationType,
  VALIDATION_METADATA,
} from '../interfaces';

/**
 * Creates a validation decorator with metadata
 * @param schema - Zod schema for validation
 * @param validationType - Type of validation (for error messages)
 * @param defaultOptions - Default options for this validation type
 * @param options - User-provided options
 */
export function createValidationDecorator<T>(
  schema: z.ZodSchema<T>,
  validationType: ValidationType,
  defaultOptions: Partial<ValidationOptions> = {},
  options?: ValidationOptions,
) {
  return function (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) {
    const metadata = {
      schema,
      options: {
        transform: true,
        stripUnknown: true,
        ...defaultOptions,
        ...options,
      },
      type: validationType,
    };

    if (propertyKey) {
      // Method decorator
      Reflect.defineMetadata(
        VALIDATION_METADATA,
        metadata,
        target,
        propertyKey,
      );
    } else {
      // Class decorator
      Reflect.defineMetadata(VALIDATION_METADATA, metadata, target);
    }

    return descriptor;
  };
}

/**
 * Utility functions to read validation metadata
 */
export function getValidationMetadata(
  target: any,
  propertyKey?: string | symbol,
):
  | {
      schema: z.ZodSchema<any>;
      options: ValidationOptions;
      type: ValidationType;
    }
  | undefined {
  return Reflect.getMetadata(VALIDATION_METADATA, target, propertyKey);
}

export function getValidationSchema(
  target: any,
  propertyKey?: string | symbol,
): z.ZodSchema<any> | undefined {
  const metadata = getValidationMetadata(target, propertyKey);
  return metadata?.schema;
}

export function getValidationOptions(
  target: any,
  propertyKey?: string | symbol,
): ValidationOptions | undefined {
  const metadata = getValidationMetadata(target, propertyKey);
  return metadata?.options;
}

export function getValidationType(
  target: any,
  propertyKey?: string | symbol,
): ValidationType | undefined {
  const metadata = getValidationMetadata(target, propertyKey);
  return metadata?.type;
}
