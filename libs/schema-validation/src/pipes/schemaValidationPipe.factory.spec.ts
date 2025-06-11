import { z } from 'zod';
import { schemaPipe } from './schemaValidationPipe.factory';
import { SchemaValidationPipe } from './schemaValidation.pipe';

describe('schemaValidationPipe Factory', () => {
  const testSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(2),
  });

  it('should create a SchemaValidationPipe instance with schema only', () => {
    const pipe = schemaPipe(testSchema);

    expect(pipe).toBeInstanceOf(SchemaValidationPipe);
  });

  it('should create a SchemaValidationPipe instance with schema and validation type', () => {
    const pipe = schemaPipe(testSchema, 'body');

    expect(pipe).toBeInstanceOf(SchemaValidationPipe);
  });

  it('should create a SchemaValidationPipe instance with all parameters', () => {
    const options = {
      errorMessage: 'Custom error',
      transform: true,
      stripUnknown: false,
    };

    const pipe = schemaPipe(testSchema, 'param', options);

    expect(pipe).toBeInstanceOf(SchemaValidationPipe);
  });

  it('should return different instances on multiple calls', () => {
    const pipe1 = schemaPipe(testSchema);
    const pipe2 = schemaPipe(testSchema);

    expect(pipe1).not.toBe(pipe2);
    expect(pipe1).toBeInstanceOf(SchemaValidationPipe);
    expect(pipe2).toBeInstanceOf(SchemaValidationPipe);
  });
});
