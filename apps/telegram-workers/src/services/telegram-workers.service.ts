import { Injectable } from '@nestjs/common';

@Injectable()
export class TelegramWorkersService {
  getHello(): string {
    return 'Hello World!';
  }
}
