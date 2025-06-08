import { DocumentParserClientPort } from './documentParserClient.port';

export abstract class DocumentParserClientFactoryPort {
  abstract getParserClientFor(mimeType: string): DocumentParserClientPort;
}
