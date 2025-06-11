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
        ...defaultOptions,
        ...options,
      },
      type: validationType,
    };

    if (propertyKey && descriptor && !isCommandOrQueryHandler(target)) {
      // Method decorator
      Reflect.defineMetadata(
        VALIDATION_METADATA,
        metadata,
        target,
        propertyKey,
      );

      return descriptor;
    } else {
      // Class decorator
      if (isCommandOrQueryHandler(target)) {
        const proto = target.prototype || target;
        Reflect.defineMetadata(VALIDATION_METADATA, metadata, proto, 'execute');
      }
      Reflect.defineMetadata(VALIDATION_METADATA, metadata, target);

      return undefined;
    }
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
  if (propertyKey !== undefined) {
    return Reflect.getMetadata(VALIDATION_METADATA, target, propertyKey);
  }
  return Reflect.getMetadata(VALIDATION_METADATA, target);
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

function isCommandOrQueryHandler(target: any): boolean {
  const prototype = target.prototype;

  // Check if the class has an execute method (required for both ICommandHandler and IQueryHandler)
  if (!prototype || typeof prototype.execute !== 'function') {
    return false;
  }

  return true;
}
