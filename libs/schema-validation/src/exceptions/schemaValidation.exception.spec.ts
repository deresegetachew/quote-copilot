import { SchemaValidationException } from './schemaValidation.exception';
import { z } from 'zod';

describe('SchemaValidationException', () => {
  const TestSchema = z.object({
    email: z.string().email(),
    age: z.number().int().min(18),
    name: z.string().min(2).max(50),
  });

  it('should create exception with formatted errors', () => {
    const invalidData = {
      email: 'invalid-email',
      age: 15,
      name: 'A',
    };

    const result = TestSchema.safeParse(invalidData);

    if (!result.success) {
      const exception = new SchemaValidationException(
        result.error,
        'Test validation',
      );

      expect(exception.schemaError).toBe(result.error);
      expect(exception.validationType).toBe('Test validation');
      expect(exception.message).toBe('Validation failed for Test validation');
      expect(exception.errors).toHaveLength(3);

      // Check that errors are properly formatted
      const emailError = exception.errors.find((e: any) => e.path === 'email');
      expect(emailError).toBeDefined();
      expect(emailError!.message).toBe('Invalid email');

      const ageError = exception.errors.find((e: any) => e.path === 'age');
      expect(ageError).toBeDefined();
      expect(ageError!.message).toBe(
        'Number must be greater than or equal to 18',
      );

      const nameError = exception.errors.find((e: any) => e.path === 'name');
      expect(nameError).toBeDefined();
      expect(nameError!.message).toBe(
        'String must contain at least 2 character(s)',
      );
    }
  });

  it('should construct without status code', () => {
    const invalidData = { email: 'invalid' };
    const result = z
      .object({ email: z.string().email() })
      .safeParse(invalidData);

    if (!result.success) {
      const exception = new SchemaValidationException(
        result.error,
        'Custom validation',
      );
      expect(exception).toBeInstanceOf(SchemaValidationException);
      expect(exception.errors.length).toBeGreaterThan(0);
    }
  });

  it('should handle nested field paths', () => {
    const NestedSchema = z.object({
      user: z.object({
        profile: z.object({
          email: z.string().email(),
        }),
      }),
    });

    const invalidData = {
      user: {
        profile: {
          email: 'invalid-email',
        },
      },
    };

    const result = NestedSchema.safeParse(invalidData);

    if (!result.success) {
      const exception = new SchemaValidationException(
        result.error,
        'Nested validation',
      );

      const emailError = exception.errors.find(
        (e: any) => e.path === 'user.profile.email',
      );
      expect(emailError).toBeDefined();
      expect(emailError!.message).toBe('Invalid email');
    }
  });

  it('should handle array field paths', () => {
    const ArraySchema = z.object({
      items: z.array(
        z.object({
          name: z.string().min(1),
        }),
      ),
    });

    const invalidData = {
      items: [
        { name: '' }, // invalid: empty string
        { name: 'valid' },
      ],
    };

    const result = ArraySchema.safeParse(invalidData);

    if (!result.success) {
      const exception = new SchemaValidationException(
        result.error,
        'Array validation',
      );

      const itemError = exception.errors.find(
        (e: any) => e.path === 'items.0.name',
      );
      expect(itemError).toBeDefined();
      expect(itemError!.message).toBe(
        'String must contain at least 1 character(s)',
      );
    }
  });
});
