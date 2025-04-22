import { Controller, Get } from '@nestjs/common';

@Controller('tenants')
export class TenantsController {
  constructor() {}

  @Get()
  listTenants(): string {
    return 'list of tenants not implemented yet';
  }
}
