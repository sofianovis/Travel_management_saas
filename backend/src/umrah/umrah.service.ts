import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UmrahService {
  constructor(private prisma: PrismaService) {}

  private mapData(data: any) {
    const { prices, costs, ...rest } = data;
    if (prices) {
      rest.priceQuad = prices.quad;
      rest.priceTriple = prices.triple;
      rest.priceDouble = prices.double;
    }
    if (costs) {
      rest.costFlight = costs.flight;
      rest.costHotel = costs.hotel;
      rest.costVisa = costs.visa;
    }
    return rest;
  }

  create(data: any) {
    if (!data.id) {
      data.id = `UM-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 900) + 100}`;
    }
    return this.prisma.umrahPackage.create({ data: this.mapData(data) });
  }

  findAll() {
    return this.prisma.umrahPackage.findMany({
      include: { pilgrims: true },
      // sorting by departure handles strings reasonably if YYYY-MM-DD
      orderBy: { departure: 'desc' }
    }).then(packages => packages.map(p => {
      const { priceQuad, priceTriple, priceDouble, costFlight, costHotel, costVisa, ...rest } = p;
      return {
        ...rest,
        booked: p.pilgrims.length,
        prices: { quad: priceQuad, triple: priceTriple, double: priceDouble },
        costs: { flight: costFlight, hotel: costHotel, visa: costVisa }
      };
    }));
  }

  findOne(id: string) {
    return this.prisma.umrahPackage.findUnique({
      where: { id },
      include: { pilgrims: { include: { customer: true } } },
    }).then(p => {
      if (!p) return null;
      const { priceQuad, priceTriple, priceDouble, costFlight, costHotel, costVisa, ...rest } = p;
      return {
        ...rest,
        booked: p.pilgrims.length,
        prices: { quad: priceQuad, triple: priceTriple, double: priceDouble },
        costs: { flight: costFlight, hotel: costHotel, visa: costVisa }
      };
    });
  }

  update(id: string, data: any) {
    return this.prisma.umrahPackage.update({
      where: { id },
      data: this.mapData(data),
    });
  }

  remove(id: string) {
    return this.prisma.umrahPackage.delete({
      where: { id },
    });
  }

  addPilgrim(packageId: string, pilgrimData: any) {
    return this.prisma.pilgrim.create({
      data: {
        ...pilgrimData,
        packageId,
      }
    });
  }

  async bookPackage(packageId: string, payload: any) {
    const { customerId, membersToBook, roomType, isPaid, visaNumber, pricePerPerson, amount } = payload;
    
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Pilgrims
      for (const customer of membersToBook) {
        await tx.pilgrim.create({
          data: {
            packageId,
            linkedCustomerId: customerId,
            name: customer.name,
            passport: customer.passport || "بدون جواز",
            nationality: customer.nationality || "جزائري",
            dateOfBirth: customer.dateOfBirth || "غير محدد",
            visaStatus: "جواز مستلم",
            visaNumber: visaNumber || "",
            roomType: roomType,
            pricePaid: isPaid ? pricePerPerson : 0,
          }
        });
      }

      // 2. Create Finance Transaction if paid
      if (isPaid) {
        await tx.financeTransaction.create({
          data: {
            id: `TRX-${Math.floor(Math.random() * 9000) + 1000}`,
            type: "دخل",
            category: "برامج عمرة",
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            ref: packageId,
            customerId: customerId,
            notes: `دفع معتمرين: ${membersToBook.map((c: any) => c.name).join('، ')} - ${membersToBook.length} أفراد (غرفة ${roomType === 'quad' ? 'رباعية' : roomType === 'triple' ? 'ثلاثية' : 'ثنائية'})`,
          }
        });
      }

      // 3. Status update on Package handled dynamically in findAll / frontend logic
      // No explicit status field update needed, but we could if we wanted.

      return { success: true };
    });
  }

  async cancelBooking(packageId: string, payload: any) {
    const { pilgrimId, amountToRefund, pilgrimName, roomType } = payload;
    
    return this.prisma.$transaction(async (tx) => {
      // 1. Delete Pilgrim
      await tx.pilgrim.delete({
        where: { id: pilgrimId }
      });

      // 2. Add Refund to Finance
      if (amountToRefund > 0) {
        await tx.financeTransaction.create({
          data: {
            id: `REF-${Math.floor(Math.random() * 9000) + 1000}`,
            type: "مصروف",
            category: "استرجاع أموال (Refund)",
            amount: amountToRefund,
            date: new Date().toISOString().split('T')[0],
            ref: packageId,
            notes: `إلغاء حجز معتمر: ${pilgrimName} - استرجاع مبلغ الغرفة ${roomType === 'quad' ? 'الرباعية' : roomType === 'triple' ? 'الثلاثية' : 'الثنائية'}`
          }
        });
      }

      return { success: true };
    });
  }

  updatePilgrim(pilgrimId: string, data: any) {
    return this.prisma.pilgrim.update({
      where: { id: pilgrimId },
      data
    });
  }

  removePilgrim(pilgrimId: string) {
    return this.prisma.pilgrim.delete({
      where: { id: pilgrimId }
    });
  }
}
