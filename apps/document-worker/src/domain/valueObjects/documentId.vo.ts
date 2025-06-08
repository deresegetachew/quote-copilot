export class DocumentId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Document ID cannot be empty');
    }
    this.value = value.trim();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: DocumentId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static generate(): DocumentId {
    // Generate a UUID-like string
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2);
    return new DocumentId(`doc_${timestamp}_${randomPart}`);
  }
}
