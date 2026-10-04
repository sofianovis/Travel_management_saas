import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UmrahService } from './umrah.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('umrah')
export class UmrahController {
  constructor(private readonly umrahService: UmrahService) {}

  @Post()
  create(@Body() data: any, @CurrentUser() user: any) {
    return this.umrahService.create(data, user.agencyId, user.branchId);
  }

  @Get()
  findAll(@Query('branchId') branchId: string, @CurrentUser() user: any) {
    const filterBranch = user.role !== 'admin' ? user.branchId : branchId;
    return this.umrahService.findAll(user.agencyId, filterBranch);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const filterBranch = user.role !== 'admin' ? user.branchId : undefined;
    return this.umrahService.findOne(id, user.agencyId, filterBranch);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.umrahService.update(id, data, user.agencyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.umrahService.remove(id, user.agencyId);
  }

  // --- Pilgrims (Manifest) endpoints ---
  @Post(':id/pilgrims')
  addPilgrim(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.umrahService.addPilgrim(id, data, user.agencyId);
  }

  @Delete(':id/pilgrims/:pilgrimId')
  removePilgrim(@Param('id') id: string, @Param('pilgrimId') pilgrimId: string, @CurrentUser() user: any) {
    return this.umrahService.removePilgrim(id, pilgrimId, user.agencyId);
  }

  @Patch(':id/pilgrims/:pilgrimId')
  updatePilgrim(@Param('id') id: string, @Param('pilgrimId') pilgrimId: string, @Body() data: any, @CurrentUser() user: any) {
    return this.umrahService.updatePilgrim(id, pilgrimId, data, user.agencyId);
  }
}
