import { Controller, Get } from '@nestjs/common';
import { DocumentWorkerService } from './document-worker.service';

@Controller()
export class DocumentWorkerController {
  constructor(private readonly documentWorkerService: DocumentWorkerService) {}

  @Get()
  getHello(): string {
    return this.documentWorkerService.getHello();
  }
}
