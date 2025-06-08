import { ZodValidationException } from '../exceptions/zod-validation.exception';
import { HttpStatus } from '@nestjs/common';
import { z } from 'zod';

describe('ZodValidationException', () => {
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
      const exception = new ZodValidationException(
        result.error,
        'Test validation',
      );

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.zodError).toBe(result.error);
      expect(exception.validationType).toBe('Test validation');

      const response = exception.getResponse() as any;
      expect(response.message).toBe('Validation failed for Test validation');
      expect(response.errors).toHaveLength(3);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);

      // Check that errors are properly formatted
      const emailError = response.errors.find((e: any) => e.path === 'email');
      expect(emailError).toBeDefined();
      expect(emailError.message).toBe('Invalid email');

      const ageError = response.errors.find((e: any) => e.path === 'age');
      expect(ageError).toBeDefined();
      expect(ageError.message).toBe(
        'Number must be greater than or equal to 18',
      );

      const nameError = response.errors.find((e: any) => e.path === 'name');
      expect(nameError).toBeDefined();
      expect(nameError.message).toBe(
        'String must contain at least 2 character(s)',
      );
    }
  });

  it('should use custom status code', () => {
    const invalidData = { email: 'invalid' };
    const result = z
      .object({ email: z.string().email() })
      .safeParse(invalidData);

    if (!result.success) {
      const exception = new ZodValidationException(
        result.error,
        'Custom validation',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

      expect(exception.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

      const response = exception.getResponse() as any;
      expect(response.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
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
      const exception = new ZodValidationException(
        result.error,
        'Nested validation',
      );

      const response = exception.getResponse() as any;
      const emailError = response.errors.find(
        (e: any) => e.path === 'user.profile.email',
      );
      expect(emailError).toBeDefined();
      expect(emailError.message).toBe('Invalid email');
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
      const exception = new ZodValidationException(
        result.error,
        'Array validation',
      );

      const response = exception.getResponse() as any;
      const itemError = response.errors.find(
        (e: any) => e.path === 'items.0.name',
      );
      expect(itemError).toBeDefined();
      expect(itemError.message).toBe(
        'String must contain at least 1 character(s)',
      );
    }
  });
});
