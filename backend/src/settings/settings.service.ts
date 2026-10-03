import { Injectable } from '@nestjs/common';
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
