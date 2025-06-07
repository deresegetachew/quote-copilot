import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentWorkerService {
  getHello(): string {
    return 'Hello World!';
  }
}
