import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  create(data: any, agencyId: string, branchId: string) {
    return this.prisma.generalBooking.create({ 
      data: { ...data, agencyId, branchId } 
    });
  }

  findAll(agencyId: string, branchId?: string) {
    const where: any = { agencyId };
    if (branchId) where.branchId = branchId;
    return this.prisma.generalBooking.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string, agencyId: string, branchId?: string) {
    const where: any = { id, agencyId };
    if (branchId) where.branchId = branchId;
    return this.prisma.generalBooking.findFirst({ 
      where,
    });
  }

  update(id: string, data: any, agencyId: string) {
    return this.prisma.generalBooking.updateMany({
      where: { id, agencyId },
      data,
    });
  }

  remove(id: string, agencyId: string) {
    return this.prisma.generalBooking.deleteMany({
      where: { id, agencyId },
    });
  }
}
