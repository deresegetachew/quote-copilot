import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class UploadDocumentDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsNotEmpty()
  content: Buffer | string;

  @IsOptional()
  @IsObject()
  metadata?: {
    size?: number;
    uploadedBy?: string;
    originalPath?: string;
    [key: string]: any;
  };
}

export interface DocumentUploadResponseDto {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}
