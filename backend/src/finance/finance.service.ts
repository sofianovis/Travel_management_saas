import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  create(data: any, agencyId: string, branchId: string) {
    return this.prisma.financeTransaction.create({ 
      data: { ...data, agencyId, branchId } 
    });
  }

  findAll(agencyId: string, branchId?: string) {
    const where: any = { agencyId };
    if (branchId) where.branchId = branchId;
    return this.prisma.financeTransaction.findMany({
      where,
      orderBy: { date: 'desc' }
    });
  }

  findOne(id: string, agencyId: string, branchId?: string) {
    const where: any = { id, agencyId };
    if (branchId) where.branchId = branchId;
    return this.prisma.financeTransaction.findFirst({ 
      where,
    });
  }

  update(id: string, data: any, agencyId: string) {
    return this.prisma.financeTransaction.updateMany({
      where: { id, agencyId },
      data,
    });
  }

  remove(id: string, agencyId: string) {
    return this.prisma.financeTransaction.deleteMany({
      where: { id, agencyId },
    });
  }
}
