import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import {
  EvtAttachmentParseRequested,
  ParseAttachmentRequestedEvent,
} from '@common';

@Controller()
export class ParseDocumentController {
  @EventPattern(EvtAttachmentParseRequested)
  async handleParseDocument(data: ParseAttachmentRequestedEvent) {
    console.log('📄 Document parsing request received:', data.data);
    // Here you would call your ParseDocumentUseCase or similar service
    // For example:
    // return this.parseDocumentUseCase.execute(data);
    // This is a placeholder for the actual implementation
  }
}
