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

  // ==========================================
  // BRANCHES MANAGEMENT
  // ==========================================
  getBranches(agencyId: string) {
    return this.prisma.branch.findMany({
      where: { agencyId },
      orderBy: { createdAt: 'asc' }
    });
  }

  createBranch(agencyId: string, data: any) {
    return this.prisma.branch.create({
      data: {
        ...data,
        agencyId,
      }
    });
  }

  updateBranch(agencyId: string, id: string, data: any) {
    return this.prisma.branch.update({
      where: { id, agencyId },
      data,
    });
  }

  deleteBranch(agencyId: string, id: string) {
    // Only allow deletion if not main branch (prevent deleting the only branch)
    return this.prisma.branch.deleteMany({
      where: { id, agencyId, isMain: false }
    });
  }

  // ==========================================
  // USERS MANAGEMENT
  // ==========================================
  getUsers(agencyId: string) {
    return this.prisma.user.findMany({
      where: { agencyId },
      include: { branch: true },
      orderBy: { createdAt: 'asc' }
    });
  }

  createUser(agencyId: string, data: any) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync(data.password, 10);
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || 'employee',
        branchId: data.branchId,
        agencyId,
      }
    });
  }

  updateUser(agencyId: string, id: string, data: any) {
    const updateData: any = { ...data };
    if (data.password) {
      const bcrypt = require('bcryptjs');
      updateData.password = bcrypt.hashSync(data.password, 10);
    }
    return this.prisma.user.update({
      where: { id, agencyId },
      data: updateData,
    });
  }

  deleteUser(agencyId: string, id: string) {
    return this.prisma.user.deleteMany({
      where: { id, agencyId }
    });
  }
}

