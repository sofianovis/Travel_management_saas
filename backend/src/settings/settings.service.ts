import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.agencySettings.findFirst();
    if (!settings) {
      settings = await this.prisma.agencySettings.create({
        data: {
          agencyName: 'وكالة النزلاء للسياحة والسفر',
          currency: 'DZD',
          monthlyTarget: 5000000,
        },
      });
    }
    return settings;
  }

  async updateSettings(data: any) {
    const settings = await this.getSettings();
    return this.prisma.agencySettings.update({
      where: { id: settings.id },
      data,
    });
  }
}
