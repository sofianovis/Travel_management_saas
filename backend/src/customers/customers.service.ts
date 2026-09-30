import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    if (!data.id) {
      data.id = `CUST-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 900) + 100}`;
    }
    return this.prisma.customer.create({ data });
  }

  findAll() {
    return this.prisma.customer.findMany({
      orderBy: { joined: 'desc' },
      include: {
        financeTransactions: true,
      }
    });
  }

  findOne(id: string) {
    return this.prisma.customer.findUnique({ 
      where: { id },
      include: {
        financeTransactions: true,
        pilgrims: { include: { package: true } }
      }
    });
  }

  update(id: string, data: any) {
    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
