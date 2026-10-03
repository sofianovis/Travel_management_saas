const fs = require('fs');

// 4. Umrah Packages
const umrahCtrl = `import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UmrahService } from './umrah.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('umrah')
export class UmrahController {
  constructor(private readonly umrahService: UmrahService) {}

  @Post()
  create(@Body() data: any, @CurrentUser() user: any) {
    return this.umrahService.create(data, user.agencyId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.umrahService.findAll(user.agencyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.umrahService.findOne(id, user.agencyId);
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
`;
fs.writeFileSync('src/umrah/umrah.controller.ts', umrahCtrl, 'utf8');

const umrahSvc = `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UmrahService {
  constructor(private prisma: PrismaService) {}

  create(data: any, agencyId: string) {
    return this.prisma.umrahPackage.create({ data: { ...data, agencyId } });
  }

  findAll(agencyId: string) {
    return this.prisma.umrahPackage.findMany({ 
      where: { agencyId },
      include: { pilgrims: true },
      orderBy: { departure: 'desc' }
    });
  }

  findOne(id: string, agencyId: string) {
    return this.prisma.umrahPackage.findFirst({ 
      where: { id, agencyId },
      include: { pilgrims: true } 
    });
  }

  update(id: string, data: any, agencyId: string) {
    return this.prisma.umrahPackage.updateMany({ where: { id, agencyId }, data });
  }

  remove(id: string, agencyId: string) {
    return this.prisma.umrahPackage.deleteMany({ where: { id, agencyId } });
  }

  async addPilgrim(packageId: string, data: any, agencyId: string) {
    const pkg = await this.prisma.umrahPackage.findFirst({ where: { id: packageId, agencyId } });
    if (!pkg) throw new NotFoundException('Package not found');
    return this.prisma.pilgrim.create({ data: { ...data, packageId } });
  }

  async removePilgrim(packageId: string, pilgrimId: string, agencyId: string) {
    const pkg = await this.prisma.umrahPackage.findFirst({ where: { id: packageId, agencyId } });
    if (!pkg) throw new NotFoundException('Package not found');
    return this.prisma.pilgrim.delete({ where: { id: pilgrimId } });
  }

  async updatePilgrim(packageId: string, pilgrimId: string, data: any, agencyId: string) {
    const pkg = await this.prisma.umrahPackage.findFirst({ where: { id: packageId, agencyId } });
    if (!pkg) throw new NotFoundException('Package not found');
    return this.prisma.pilgrim.update({ where: { id: pilgrimId }, data });
  }
}
`;
fs.writeFileSync('src/umrah/umrah.service.ts', umrahSvc, 'utf8');

// 5. Settings
const setCtrl = `import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(@CurrentUser() user: any) {
    return this.settingsService.getSettings(user.agencyId);
  }

  @Patch()
  updateSettings(@Body() data: any, @CurrentUser() user: any) {
    return this.settingsService.updateSettings(user.agencyId, data);
  }
}
`;
fs.writeFileSync('src/settings/settings.controller.ts', setCtrl, 'utf8');

const setSvc = `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(agencyId: string) {
    let settings = await this.prisma.agencySettings.findUnique({ where: { agencyId } });
    if (!settings) {
      settings = await this.prisma.agencySettings.create({
        data: { agencyId, agencyName: "وكالة جديدة" }
      });
    }
    return settings;
  }

  updateSettings(agencyId: string, data: any) {
    return this.prisma.agencySettings.update({
      where: { agencyId },
      data,
    });
  }
}
`;
fs.writeFileSync('src/settings/settings.service.ts', setSvc, 'utf8');

console.log("Rewrote Umrah and Settings.");
