import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
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
