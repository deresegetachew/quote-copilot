export class DocumentEntity {
  private readonly id: string;
  private readonly fileName: string;
  private readonly mimeType: string;
  private readonly content: Buffer | string;
  private readonly metadata: DocumentMetadata;
  private status: DocumentStatus;
  private extractedText?: string;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(props: {
    id: string;
    fileName: string;
    mimeType: string;
    content: Buffer | string;
    metadata: DocumentMetadata;
    status?: DocumentStatus;
    extractedText?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.fileName = props.fileName;
    this.mimeType = props.mimeType;
    this.content = props.content;
    this.metadata = props.metadata;
    this.status = props.status || DocumentStatus.PENDING;
    this.extractedText = props.extractedText;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  getId(): string {
    return this.id;
  }

  getFileName(): string {
    return this.fileName;
  }

  getMimeType(): string {
    return this.mimeType;
  }

  getContent(): Buffer | string {
    return this.content;
  }

  getMetadata(): DocumentMetadata {
    return this.metadata;
  }

  getStatus(): DocumentStatus {
    return this.status;
  }

  getExtractedText(): string | undefined {
    return this.extractedText;
  }

  setStatus(status: DocumentStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  setExtractedText(text: string): void {
    this.extractedText = text;
    this.updatedAt = new Date();
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}

export interface DocumentMetadata {
  size: number;
  pages?: number;
  author?: string;
  creationDate?: Date;
  modificationDate?: Date;
  [key: string]: any;
}

export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
}
