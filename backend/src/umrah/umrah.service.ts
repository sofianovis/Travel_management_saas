import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UmrahService {
  constructor(private prisma: PrismaService) {}

  create(data: any, agencyId: string, branchId: string) {
    return this.prisma.umrahPackage.create({ data: { ...data, agencyId, branchId } });
  }

  findAll(agencyId: string, branchId?: string) {
    const where: any = { agencyId };
    if (branchId) where.branchId = branchId;
    return this.prisma.umrahPackage.findMany({ 
      where,
      include: { pilgrims: true },
      orderBy: { departure: 'desc' }
    });
  }

  findOne(id: string, agencyId: string, branchId?: string) {
    const where: any = { id, agencyId };
    if (branchId) where.branchId = branchId;
    return this.prisma.umrahPackage.findFirst({ 
      where,
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
