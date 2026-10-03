import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly service: BookingsService) {}

  @Post()
  create(@Body() data: any, @CurrentUser() user: any) {
    return this.service.create(data, user.agencyId, user.branchId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.agencyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user.agencyId);
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
