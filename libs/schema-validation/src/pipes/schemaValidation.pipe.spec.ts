import { Test, TestingModule } from '@nestjs/testing';
import { SchemaValidationPipe } from './schemaValidation.pipe';
import { SchemaValidationException } from '../exceptions/schemaValidation.exception';
import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';

describe('SchemaValidationPipe', () => {
  let pipe: SchemaValidationPipe;

  const TestSchema = z.object({
    email: z.string().email(),
    age: z.number().int().min(18),
    name: z.string().min(2).max(50),
  });

  beforeEach(async () => {
    pipe = new SchemaValidationPipe(TestSchema, 'Test validation');
  });

  describe('transform', () => {
    it('should validate and return valid data', () => {
      const validData = {
        email: 'test@example.com',
        age: 25,
        name: 'John Doe',
      };

      const result = pipe.transform(validData, { type: 'body' });

      expect(result).toEqual(validData);
    });

    it('should throw SchemaValidationException for invalid data', () => {
      const invalidData = {
        email: 'invalid-email',
        age: 15,
        name: 'A',
      };

      expect(() => pipe.transform(invalidData, { type: 'body' })).toThrow(
        SchemaValidationException,
      );
    });

    it('should handle missing required fields', () => {
      const incompleteData = {
        email: 'test@example.com',
      };

      expect(() => pipe.transform(incompleteData, { type: 'body' })).toThrow(
        SchemaValidationException,
      );
    });

    it('should transform data when transform option is enabled', () => {
      const transformPipe = new SchemaValidationPipe(
        z.object({
          age: z.coerce.number(),
          active: z.coerce.boolean(),
        }),
        'Transform test',
        { transform: true },
      );

      const inputData = {
        age: '25',
        active: 'true',
      };

      const result = transformPipe.transform(inputData, { type: 'body' });

      expect(result.age).toBe(25);
      expect(result.active).toBe(true);
    });

    it('should handle nested object validation', () => {
      const NestedSchema = z.object({
        user: z.object({
          email: z.string().email(),
          profile: z.object({
            name: z.string().min(2),
          }),
        }),
      });

      const nestedPipe = new SchemaValidationPipe(
        NestedSchema,
        'Nested validation',
      );

      const validNestedData = {
        user: {
          email: 'test@example.com',
          profile: {
            name: 'John',
          },
        },
      };

      const result = nestedPipe.transform(validNestedData, { type: 'body' });
      expect(result).toEqual(validNestedData);
    });

    it('should handle array validation', () => {
      const ArraySchema = z.object({
        users: z.array(
          z.object({
            email: z.string().email(),
            name: z.string(),
          }),
        ),
      });

      const arrayPipe = new SchemaValidationPipe(
        ArraySchema,
        'Array validation',
      );

      const validArrayData = {
        users: [
          { email: 'user1@example.com', name: 'User 1' },
          { email: 'user2@example.com', name: 'User 2' },
        ],
      };

      const result = arrayPipe.transform(validArrayData, { type: 'body' });
      expect(result).toEqual(validArrayData);
    });
  });
});
