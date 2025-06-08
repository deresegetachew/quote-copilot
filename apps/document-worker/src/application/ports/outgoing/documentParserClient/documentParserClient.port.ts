export abstract class DocumentParserClientPort {
  abstract parse(content: Buffer): Promise<string>;
}
