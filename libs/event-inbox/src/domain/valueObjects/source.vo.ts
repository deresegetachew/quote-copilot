export class SourceVO {
  constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  static of(value: string): SourceVO {
    return new SourceVO(value);
  }

  toString(): string {
    return this._value;
  }

  equals(other: SourceVO): boolean {
    return this._value === other.value;
  }
}
