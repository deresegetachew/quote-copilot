import {
  validateWithSchema,
  safeValidateWithSchema,
} from '../utils/validation.utils';
import { z } from 'zod';
import { SchemaValidationException } from '../exceptions';

describe('ValidationUtils', () => {
  const TestSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2),
    age: z.number().int().min(18),
  });

  describe('validateWithSchema', () => {
    it('should return parsed data for valid input', () => {
      const validData = {
        email: 'test@example.com',
        name: 'John Doe',
        age: 25,
      };

      const result = validateWithSchema(TestSchema, validData);
      expect(result).toEqual(validData);
    });

    it('should throw SchemaValidationException for invalid data', () => {
      const invalidData = {
        email: 'invalid-email',
        name: 'A',
        age: 15,
      };

      expect(() => validateWithSchema(TestSchema, invalidData)).toThrow(
        SchemaValidationException,
      );
    });
  });

  describe('safeValidateWithSchema', () => {
    it('should return success for valid data', () => {
      const validData = {
        email: 'test@example.com',
        name: 'John Doe',
        age: 25,
      };

      const result = safeValidateWithSchema(TestSchema, validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should return error for invalid data', () => {
      const invalidData = {
        email: 'invalid-email',
        name: 'A',
        age: 15,
      };

      const result = safeValidateWithSchema(TestSchema, invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        const errorResult = result as { success: false; errors: any };
        expect(errorResult.errors).toBeDefined();
        expect(errorResult.errors.issues).toHaveLength(3);
      }
    });
  });

  describe('type transformations', () => {
    it('should handle coercion when enabled', () => {
      const CoercionSchema = z.object({
        age: z.coerce.number(),
        active: z.coerce.boolean(),
      });

      const stringData = {
        age: '25',
        active: 'true',
      };

      const result = validateWithSchema(CoercionSchema, stringData);
      expect(result.age).toBe(25);
      expect(result.active).toBe(true);
    });

    it('should handle optional fields', () => {
      const OptionalSchema = z.object({
        name: z.string(),
        nickname: z.string().optional(),
      });

      const partialData = {
        name: 'John',
      };

      const result = validateWithSchema(OptionalSchema, partialData);
      expect(result.name).toBe('John');
      expect(result.nickname).toBeUndefined();
    });

    it('should handle default values', () => {
      const DefaultSchema = z.object({
        name: z.string(),
        active: z.boolean().default(true),
      });

      const minimalData = {
        name: 'John',
      };

      const result = validateWithSchema(DefaultSchema, minimalData);
      expect(result.name).toBe('John');
      expect(result.active).toBe(true);
    });
  });
});
