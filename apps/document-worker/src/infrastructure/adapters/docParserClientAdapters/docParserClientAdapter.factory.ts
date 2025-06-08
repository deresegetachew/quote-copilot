import { Injectable } from '@nestjs/common';
import { PdfClientAdapter } from './pdfClient.adapter';
import { OcrClientAdapter } from './ocrClient.adapter';
import { DocumentParserClientPort } from '../../../application/ports/outgoing/documentParserClient/documentParserClient.port';
import { DocumentParserClientFactoryPort } from '../../../application/ports/outgoing/documentParserClient/documentParserClientFactory.port';
import { DocumentTypeVO } from '../../../domain/valueObjects/documentType.vo';

@Injectable()
export class DocParserClientAdapterFactory
  implements DocumentParserClientFactoryPort
{
  constructor(
    private readonly pdfParserClient: PdfClientAdapter,
    private readonly ocrClientAdapter: OcrClientAdapter,
  ) {}

  public getParserClientFor(mimeType: string): DocumentParserClientPort {
    if (!DocumentTypeVO.isSupported(mimeType)) {
      throw new Error(
        `Unsupported document type: ${mimeType}. Supported types are: ${DocumentTypeVO.getSupportedTypes().join(', ')}`,
      );
    }
    const docType = DocumentTypeVO.of(mimeType);

    if (docType.isPDF()) {
      return this.pdfParserClient;
    } else if (docType.isImage()) {
      return this.ocrClientAdapter;
    } else {
      throw new Error(`Unsupported document type: ${mimeType}`);
    }
  }
}
