import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { customerId, customerName, phone, type, destination, provider, date, returnDate, pnr, status, paymentStatus, paymentMethod, amount, cost, passengers, attachments, notes, paidAmount } = data;
    
    return this.prisma.$transaction(async (tx) => {
      const newId = `B-${Math.floor(Math.random() * 90000) + 10000}`;
      
      const booking = await tx.generalBooking.create({
        data: {
          id: newId,
          customerId: customerId || null,
          customerName: customerName || "غير معروف",
          phone: phone || "",
          type: type || "طيران",
          destination: destination || "",
          provider: provider || "",
          date: date || "",
          returnDate: returnDate || "",
          pnr: pnr || "",
          status: status || "قيد الانتظار",
          paymentStatus: paymentStatus || "غير مدفوع",
          paymentMethod: paymentMethod || "نقداً",
          amount: parseFloat(amount) || 0,
          cost: parseFloat(cost) || 0,
          paidAmount: parseFloat(paidAmount) || 0,
          passengers: passengers || "",
          attachments: attachments || "",
          notes: notes || ""
        }
      });

      if (paymentStatus === "مدفوع بالكامل" || paymentStatus === "مدفوع جزئياً") {
        await tx.financeTransaction.create({
          data: {
            id: `TRX-${Math.floor(Math.random() * 9000) + 1000}`,
            type: "دخل",
            category: `حجوزات ${type || "طيران"}`,
            amount: parseFloat(paidAmount) || parseFloat(amount) || 0,
            method: paymentMethod || "Cash",
            date: new Date().toISOString().split('T')[0],
            ref: newId,
            customerId: customerId || null,
            notes: `حجز ${type}: ${customerName} - ${destination || provider}`
          }
        });
      }

      return booking;
    });
  }

  findAll() {
    return this.prisma.generalBooking.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.generalBooking.findUnique({
      where: { id }
    });
  }

  async update(id: string, data: any) {
    const { customerId, customerName, phone, type, destination, provider, date, returnDate, pnr, status, paymentStatus, paymentMethod, amount, cost, passengers, attachments, notes, paidAmount } = data;
    
    return this.prisma.$transaction(async (tx) => {
      const oldBooking = await tx.generalBooking.findUnique({ where: { id } });
      
      const booking = await tx.generalBooking.update({
        where: { id },
        data: {
          customerId: customerId || null,
          customerName, phone, type, destination, provider, date, returnDate, pnr, status, paymentStatus, paymentMethod,
          amount: parseFloat(amount) || 0,
          cost: parseFloat(cost) || 0,
          paidAmount: parseFloat(paidAmount) || parseFloat(amount) || 0,
          passengers, attachments, notes
        }
      });

      // Smart Finance Sync
      if (oldBooking) {
        const wasPaid = oldBooking.paymentStatus === "مدفوع بالكامل" || oldBooking.paymentStatus === "مدفوع جزئياً";
        const isPaid = paymentStatus === "مدفوع بالكامل" || paymentStatus === "مدفوع جزئياً";
        
        if (isPaid) {
          // If it was already paid, maybe amount changed, so we update the transaction
          const existingTx = await tx.financeTransaction.findFirst({ where: { ref: id, type: "دخل" } });
          if (existingTx) {
            await tx.financeTransaction.update({
              where: { id: existingTx.id },
              data: { amount: parseFloat(paidAmount) || parseFloat(amount) || 0, customerId: customerId || null }
            });
          } else {
            // It became paid
            await tx.financeTransaction.create({
              data: {
                id: `TRX-${Math.floor(Math.random() * 9000) + 1000}`,
                type: "دخل",
                category: `حجوزات ${type || "طيران"}`,
                amount: parseFloat(amount) || 0,
                date: new Date().toISOString().split('T')[0],
                ref: id,
                customerId: customerId || null,
                notes: `تعديل - حجز ${type}: ${customerName} - ${destination || provider}`
              }
            });
          }
        } else if (!isPaid && wasPaid) {
          // It became unpaid, delete existing transaction
          await tx.financeTransaction.deleteMany({
            where: { ref: id, type: "دخل" }
          });
        }
      }

      return booking;
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const b = await tx.generalBooking.findUnique({ where: { id } });
      if (b && (b.paymentStatus === "مدفوع بالكامل" || b.paymentStatus === "مدفوع جزئياً")) {
        await tx.financeTransaction.create({
          data: {
            id: `REF-${Math.floor(Math.random() * 9000) + 1000}`,
            type: "مصروف",
            category: "استرجاع أموال (Refund)",
            amount: b.amount,
            date: new Date().toISOString().split('T')[0],
            ref: id,
            customerId: b.customerId || null,
            notes: `إلغاء حجز ${b.type}: استرجاع مبلغ للعميل ${b.customerName}`
          }
        });
      }
      return tx.generalBooking.delete({ where: { id } });
    });
  }
}
