import { randomUUID } from 'crypto';

export class ID {
  private constructor(private readonly value: string) {}

  public static create(value?: string): ID {
    return new ID(value ?? randomUUID());
  }

  public static isValid(value: string): boolean {
    // Validate UUID v4 using regex
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(value);
  }

  static of(value: string): ID {
    if (!ID.isValid(value)) {
      throw new Error(`Invalid ID value: ${value}`);
    }
    return new ID(value);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: ID): boolean {
    return this.value === other.value;
  }
}
