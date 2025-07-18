import { randomUUID } from 'crypto';

export class MessageIdVO {
  constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  static new(value?: string): MessageIdVO {
    return new MessageIdVO(value ?? randomUUID());
  }

  public static isValid(value: string): boolean {
    // Validate UUID v4 using regex
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(value);
  }

  static of(value: string): MessageIdVO {
    if (!MessageIdVO.isValid(value)) {
      throw new Error(`Invalid MessageId value: ${value}`);
    }

    return new MessageIdVO(value);
  }

  getValue(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: MessageIdVO): boolean {
    return this._value === other.value;
  }
}
