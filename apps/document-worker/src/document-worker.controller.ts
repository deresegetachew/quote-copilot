import { Controller, Get } from '@nestjs/common';
import { DocumentWorkerService } from './document-worker.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class DocumentWorkerController {
  constructor(private readonly documentWorkerService: DocumentWorkerService) {}

  @Get()
  getHello(): string {
    return this.documentWorkerService.getHello();
  }

  @MessagePattern('document.process')
  async processDocument(@Payload() data: any) {
    console.log('📄 Document processing request received:', data);
    return this.documentWorkerService.processDocument(data);
  }

  @MessagePattern('document.parse')
  async parseDocument(@Payload() data: any) {
    console.log('📄 Document parsing request received:', data);
    return this.documentWorkerService.parseDocument(data);
  }
}
