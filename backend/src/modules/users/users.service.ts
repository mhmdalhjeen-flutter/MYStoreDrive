import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByPhoneNumber(phoneNumber: string) {
    return this.prisma.user.findUnique({
      where: { phoneNumber },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: {
    phoneNumber: string;
    name?: string;
    email?: string;
    passwordHash?: string;
    role?: UserRole;
  }) {
    return this.prisma.user.create({
      data: {
        ...data,
        role: data.role ?? UserRole.CUSTOMER,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      passwordHash?: string;
      isPhoneVerified?: boolean;
    },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async verifyPhone(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isPhoneVerified: true },
    });
  }
}
