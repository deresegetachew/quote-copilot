import { Module } from '@nestjs/common';
import { PdfClientAdapter } from './pdfClient.adapter';
import { OcrClientAdapter } from './ocrClient.adapter';
import { DocumentParserClientFactoryPort } from '../../../application/ports/outgoing/documentParserClient/documentParserClientFactory.port';
import { DocParserClientAdapterFactory } from './docParserClientAdapter.factory';

@Module({
  providers: [
    PdfClientAdapter,
    OcrClientAdapter,
    {
      provide: DocumentParserClientFactoryPort,
      useClass: DocParserClientAdapterFactory,
    },
  ],
  exports: [],
})
export class DocParserClientAdapterModule {}
