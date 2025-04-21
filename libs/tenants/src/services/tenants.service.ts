import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class TenantsService {
  findAll(): void {
    throw new NotImplementedException('Not implemented');
  }

  findOne(): void {
    throw new NotImplementedException('Not implemented');
  }
}
