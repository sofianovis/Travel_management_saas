const fs = require('fs');

function rewriteController(moduleName, capitalizedName) {
  const code = `import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ${capitalizedName}Service } from './${moduleName}.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('${moduleName}')
export class ${capitalizedName}Controller {
  constructor(private readonly service: ${capitalizedName}Service) {}

  @Post()
  create(@Body() data: any, @CurrentUser() user: any) {
    return this.service.create(data, user.agencyId, user.branchId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user.agencyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user.agencyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.service.update(id, data, user.agencyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user.agencyId);
  }
}
`;
  fs.writeFileSync(`src/${moduleName}/${moduleName}.controller.ts`, code, 'utf8');
}

function rewriteService(moduleName, capitalizedName, modelName, includes) {
  const code = `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ${capitalizedName}Service {
  constructor(private prisma: PrismaService) {}

  create(data: any, agencyId: string, branchId: string) {
    return this.prisma.${modelName}.create({ 
      data: { ...data, agencyId${modelName !== 'umrahPackage' && modelName !== 'agencySettings' ? ', branchId' : ''} } 
    });
  }

  findAll(agencyId: string) {
    return this.prisma.${modelName}.findMany({
      where: { agencyId },
      ${includes ? `include: ${includes},` : ''}
    });
  }

  findOne(id: string, agencyId: string) {
    return this.prisma.${modelName}.findFirst({ 
      where: { id, agencyId },
      ${includes ? `include: ${includes},` : ''}
    });
  }

  update(id: string, data: any, agencyId: string) {
    return this.prisma.${modelName}.updateMany({
      where: { id, agencyId },
      data,
    });
  }

  remove(id: string, agencyId: string) {
    return this.prisma.${modelName}.deleteMany({
      where: { id, agencyId },
    });
  }
}
`;
  fs.writeFileSync(`src/${moduleName}/${moduleName}.service.ts`, code, 'utf8');
}

// 1. Customers
rewriteController('customers', 'Customers');
rewriteService('customers', 'Customers', 'customer', '{ financeTransactions: true }');

// 2. Bookings
rewriteController('bookings', 'Bookings');
rewriteService('bookings', 'Bookings', 'generalBooking', null);

// 3. Finance
rewriteController('finance', 'Finance');
rewriteService('finance', 'Finance', 'financeTransaction', null);

console.log("Rewrote Customers, Bookings, and Finance.");
