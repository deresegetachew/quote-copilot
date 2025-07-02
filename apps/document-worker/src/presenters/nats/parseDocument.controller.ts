import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { AttachmentParsingRequestedEvt } from '@common/events';

@Controller()
export class ParseDocumentController {
  @EventPattern(AttachmentParsingRequestedEvt.EvtTopicKey)
  async handleParseDocument(evt: AttachmentParsingRequestedEvt) {
    console.log('📄 Document parsing request received:', evt);
    // Here you would call your ParseDocumentUseCase or similar service
    // For example:
    // return this.parseDocumentUseCase.execute(data);
    // This is a placeholder for the actual implementation
  }
}
