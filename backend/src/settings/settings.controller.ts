import { Controller, Get, Patch, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
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

  // ==========================
  // BRANCHES
  // ==========================
  @Get('branches')
  getBranches(@CurrentUser() user: any) {
    return this.settingsService.getBranches(user.agencyId);
  }

  @Post('branches')
  createBranch(@Body() data: any, @CurrentUser() user: any) {
    return this.settingsService.createBranch(user.agencyId, data);
  }

  @Patch('branches/:id')
  updateBranch(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.settingsService.updateBranch(user.agencyId, id, data);
  }

  @Delete('branches/:id')
  deleteBranch(@Param('id') id: string, @CurrentUser() user: any) {
    return this.settingsService.deleteBranch(user.agencyId, id);
  }

  // ==========================
  // USERS (EMPLOYEES)
  // ==========================
  @Get('users')
  getUsers(@CurrentUser() user: any) {
    return this.settingsService.getUsers(user.agencyId);
  }

  @Post('users')
  createUser(@Body() data: any, @CurrentUser() user: any) {
    return this.settingsService.createUser(user.agencyId, data);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.settingsService.updateUser(user.agencyId, id, data);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string, @CurrentUser() user: any) {
    return this.settingsService.deleteUser(user.agencyId, id);
  }
}

