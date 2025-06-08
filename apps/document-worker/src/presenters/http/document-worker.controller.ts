import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ProcessDocumentUseCase,
  ProcessDocumentCommand,
} from '../../application/useCases/processDocument.useCase';
import {
  UploadDocumentDto,
  DocumentUploadResponseDto,
} from '@common/dtos/document-worker';

@Controller('document-worker')
export class DocumentWorkerController {
  constructor(
    private readonly processDocumentUseCase: ProcessDocumentUseCase,
  ) {}

  @Get()
  getHello(): string {
    return 'Hello World from Document Worker!';
  }

  @Post('upload')
  async uploadDocument(
    @Body() data: UploadDocumentDto,
  ): Promise<DocumentUploadResponseDto> {
    console.log('📄 Document upload request received:', data.fileName);

    try {
      // Create command for processing
      const command: ProcessDocumentCommand = {
        fileName: data.fileName,
        mimeType: data.mimeType,
        content: data.content,
        metadata: data.metadata,
      };

      // Process the document
      const result = await this.processDocumentUseCase.execute(command);

      return {
        success: true,
        message: 'Document uploaded and processing started',
        data: result,
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      return {
        success: false,
        message: 'Failed to upload document',
        error: error.message,
      };
    }
  }
}
