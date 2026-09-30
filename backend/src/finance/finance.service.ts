import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    if (!data.id) {
      data.id = `TRX-${Math.floor(Math.random() * 9000) + 1000}`;
    }
    if (data.customerId === "") delete data.customerId;
    if (data.supplierName === "") delete data.supplierName;
    if (data.ref === "") delete data.ref;
    
    return this.prisma.financeTransaction.create({ data });
  }

  findAll() {
    return this.prisma.financeTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: { customer: true }
    });
  }

  findOne(id: string) {
    return this.prisma.financeTransaction.findUnique({
      where: { id },
      include: { customer: true }
    });
  }

  update(id: string, data: any) {
    if (data.customerId === "") delete data.customerId;
    if (data.supplierName === "") delete data.supplierName;
    if (data.ref === "") delete data.ref;
    
    return this.prisma.financeTransaction.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.financeTransaction.delete({
      where: { id },
    });
  }
}
