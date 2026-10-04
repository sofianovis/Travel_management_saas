import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && bcrypt.compareSync(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role, 
      agencyId: user.agencyId,
      branchId: user.branchId
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        agencyId: user.agencyId,
        branchId: user.branchId
      }
    };
  }

  async registerAgency(data: any) {
    const existingAgency = await this.prisma.agency.findUnique({ where: { subdomain: data.subdomain } });
    if (existingAgency) {
      throw new BadRequestException('اسم النطاق الفرعي محجوز بالفعل.');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new BadRequestException('البريد الإلكتروني مستخدم بالفعل.');
    }

    const hashedPassword = bcrypt.hashSync(data.password, 10);

    const newAgency = await this.prisma.$transaction(async (tx) => {
      const agency = await tx.agency.create({
        data: {
          name: data.agencyName,
          subdomain: data.subdomain,
          plan: 'basic',
          settings: {
            create: {
              agencyName: data.agencyName
            }
          }
        }
      });

      const branch = await tx.branch.create({
        data: {
          name: 'الفرع الرئيسي',
          isMain: true,
          agencyId: agency.id
        }
      });

      const user = await tx.user.create({
        data: {
          name: data.adminName,
          email: data.email,
          password: hashedPassword,
          role: 'admin',
          agencyId: agency.id,
          branchId: branch.id
        }
      });

      return { agency, user };
    });

    return this.login(newAgency.user);
  }
}
