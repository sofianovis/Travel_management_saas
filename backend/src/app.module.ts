import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { UmrahModule } from './umrah/umrah.module.js';
import { FinanceModule } from './finance/finance.module.js';
import { BookingsModule } from './bookings/bookings.module.js';

@Module({
  imports: [PrismaModule, SettingsModule, CustomersModule, UmrahModule, FinanceModule, BookingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
