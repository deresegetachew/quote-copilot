import { Injectable } from '@nestjs/common';

@Injectable()
export class WhatsappWorkersService {
  getHello(): string {
    return 'Hello World!';
  }
}
