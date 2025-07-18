import { createHash } from 'crypto';

export class HashVO {
  constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  static of(value: string): HashVO {
    return new HashVO(value);
  }

  static fromObject(obj: any, algorithm: string = 'sha256'): HashVO {
    const serialized = JSON.stringify(obj, Object.keys(obj).sort()); // Sort keys for consistent hashing
    const hash = createHash(algorithm).update(serialized, 'utf8').digest('hex');
    return new HashVO(hash);
  }

  static fromString(input: string, algorithm: string = 'sha256'): HashVO {
    const hash = createHash(algorithm).update(input, 'utf8').digest('hex');
    return new HashVO(hash);
  }

  getValue(): string {
    return this.value;
  }

  getShort(length: number = 8): string {
    return this.value.substring(0, length);
  }

  toString(): string {
    return this.value;
  }

  equals(other: HashVO): boolean {
    return this.value === other.value;
  }
}
