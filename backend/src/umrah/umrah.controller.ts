import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UmrahService } from './umrah.service.js';

@Controller('umrah')
export class UmrahController {
  constructor(private readonly umrahService: UmrahService) {}

  @Post()
  create(@Body() createUmrahDto: any) {
    return this.umrahService.create(createUmrahDto);
  }

  @Get()
  findAll() {
    return this.umrahService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.umrahService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUmrahDto: any) {
    return this.umrahService.update(id, updateUmrahDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.umrahService.remove(id);
  }

  @Post(':id/pilgrims')
  addPilgrim(@Param('id') packageId: string, @Body() pilgrimData: any) {
    return this.umrahService.addPilgrim(packageId, pilgrimData);
  }

  @Post(':id/book')
  bookPackage(@Param('id') packageId: string, @Body() payload: any) {
    return this.umrahService.bookPackage(packageId, payload);
  }

  @Post(':id/cancel-booking')
  cancelBooking(@Param('id') packageId: string, @Body() payload: any) {
    return this.umrahService.cancelBooking(packageId, payload);
  }

  @Patch('pilgrims/:pilgrimId')
  updatePilgrim(@Param('pilgrimId') pilgrimId: string, @Body() data: any) {
    return this.umrahService.updatePilgrim(pilgrimId, data);
  }

  @Delete('pilgrims/:pilgrimId')
  removePilgrim(@Param('pilgrimId') pilgrimId: string) {
    return this.umrahService.removePilgrim(pilgrimId);
  }
}
