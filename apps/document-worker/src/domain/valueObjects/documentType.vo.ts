type TDocCategory = 'document' | 'image' | 'text';

export class DocumentTypeVO {
  private static readonly SUPPORTED_TYPES = new Map<
    string,
    { extension: string; category: TDocCategory }
  >([
    ['application/pdf', { extension: 'pdf', category: 'document' }],
    ['text/plain', { extension: 'txt', category: 'text' }],
    ['image/jpeg', { extension: 'jpg', category: 'image' }],
    ['image/png', { extension: 'png', category: 'image' }],
    ['image/tiff', { extension: 'tiff', category: 'image' }],
  ]);

  constructor(private readonly mimeType: string) {}

  static of(mimeType: string): DocumentTypeVO {
    if (!DocumentTypeVO.isSupported(mimeType)) {
      throw new Error(`Unsupported document type: ${mimeType}`);
    }
    return new DocumentTypeVO(mimeType);
  }

  getMimeType(): string {
    return this.mimeType;
  }

  getExtension(): string {
    const typeInfo = DocumentTypeVO.SUPPORTED_TYPES.get(this.mimeType);
    return typeInfo?.extension || 'unknown';
  }

  getCategory(): string {
    const typeInfo = DocumentTypeVO.SUPPORTED_TYPES.get(this.mimeType);
    return typeInfo?.category || 'unknown';
  }

  isPDF(): boolean {
    return this.mimeType === 'application/pdf';
  }

  isImage(): boolean {
    return this.getCategory() === 'image';
  }

  isText(): boolean {
    return this.getCategory() === 'text';
  }

  equals(other: DocumentTypeVO): boolean {
    return this.mimeType === other.getMimeType();
  }

  toString(): string {
    return this.mimeType;
  }

  static isSupported(mimeType: string, category?: TDocCategory): boolean {
    if (!DocumentTypeVO.SUPPORTED_TYPES.has(mimeType)) {
      return false;
    }

    if (category) {
      const typeInfo = DocumentTypeVO.SUPPORTED_TYPES.get(mimeType);
      return typeInfo ? typeInfo.category === category : false;
    }
    return true;
  }

  static getSupportedTypes(category?: TDocCategory): string[] {
    if (category) {
      return Array.from(DocumentTypeVO.SUPPORTED_TYPES.entries())
        .filter(([, info]) => info.category === category)
        .map(([type]) => type);
    }
    return Array.from(DocumentTypeVO.SUPPORTED_TYPES.keys());
  }
}
