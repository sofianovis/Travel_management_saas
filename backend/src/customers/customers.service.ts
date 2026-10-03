import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  create(data: any, agencyId: string, branchId: string) {
    return this.prisma.customer.create({ 
      data: { ...data, agencyId, branchId } 
    });
  }

  findAll(agencyId: string) {
    return this.prisma.customer.findMany({
      where: { agencyId },
      include: { financeTransactions: true },
    });
  }

  findOne(id: string, agencyId: string) {
    return this.prisma.customer.findFirst({ 
      where: { id, agencyId },
      include: { financeTransactions: true },
    });
  }

  update(id: string, data: any, agencyId: string) {
    return this.prisma.customer.updateMany({
      where: { id, agencyId },
      data,
    });
  }

  remove(id: string, agencyId: string) {
    return this.prisma.customer.deleteMany({
      where: { id, agencyId },
    });
  }
}
