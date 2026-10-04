import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Post()
  create(@Body() data: any, @CurrentUser() user: any) {
    return this.service.create(data, user.agencyId, user.branchId);
  }

  @Get()
  findAll(@Query('branchId') branchId: string, @CurrentUser() user: any) {
    const filterBranch = user.role !== 'admin' ? user.branchId : branchId;
    return this.service.findAll(user.agencyId, filterBranch);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const filterBranch = user.role !== 'admin' ? user.branchId : undefined;
    return this.service.findOne(id, user.agencyId, filterBranch);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.service.update(id, data, user.agencyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user.agencyId);
  }
}
