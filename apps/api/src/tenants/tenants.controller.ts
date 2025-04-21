import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { Tenant, TenantsService } from '@tenants';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  listTenants(): Tenant[] {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  getTenant(@Param('id') id: string): Tenant {
    const tenant = this.tenantsService.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${id}' not found`);
    }
    return tenant;
  }
}
