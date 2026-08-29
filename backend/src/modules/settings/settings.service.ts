import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationException } from '../../common/exceptions/business.exception';
import { UpdateSettingsDto } from './dtos/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.settings.findFirst();

    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          storeName: 'متجر',
          freeDeliveryTarget: new Prisma.Decimal(10),
          partialFreeDeliveryThreshold: new Prisma.Decimal(5),
          partialFreeDeliveryDiscount: 50,
        },
      });
    }

    return settings;
  }

  async getPublicSettings() {
    const settings = await this.getSettings();
    return {
      storeName: settings.storeName,
      storeNameEn: settings.storeNameEn,
      storePhone: settings.storePhone,
      storeEmail: settings.storeEmail,
      socialMediaLinks: settings.socialMediaLinks,
      isStoreOpen: settings.isStoreOpen,
      storeClosedMessage: settings.storeClosedMessage,
      freeDeliveryTarget: settings.freeDeliveryTarget,
      partialFreeDeliveryEnabled: settings.partialFreeDeliveryEnabled,
      partialFreeDeliveryThreshold: settings.partialFreeDeliveryThreshold,
      partialFreeDeliveryDiscount: settings.partialFreeDeliveryDiscount,
    };
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const current = await this.getSettings();

    const target =
      dto.freeDeliveryTarget !== undefined
        ? new Prisma.Decimal(dto.freeDeliveryTarget)
        : current.freeDeliveryTarget;
    const threshold =
      dto.partialFreeDeliveryThreshold !== undefined
        ? new Prisma.Decimal(dto.partialFreeDeliveryThreshold)
        : current.partialFreeDeliveryThreshold;

    if (
      dto.partialFreeDeliveryEnabled !== false &&
      threshold.greaterThanOrEqualTo(target)
    ) {
      throw new ValidationException(
        'Partial free delivery threshold must be strictly less than free delivery target',
      );
    }

    const data: any = { ...dto };
    if (dto.freeDeliveryTarget !== undefined) {
      data.freeDeliveryTarget = new Prisma.Decimal(dto.freeDeliveryTarget);
    }
    if (dto.partialFreeDeliveryThreshold !== undefined) {
      data.partialFreeDeliveryThreshold = new Prisma.Decimal(dto.partialFreeDeliveryThreshold);
    }

    return this.prisma.settings.update({
      where: { id: current.id },
      data,
    });
  }

  async getDeliverySettings() {
    const settings = await this.getSettings();
    return {
      freeDeliveryTarget: settings.freeDeliveryTarget,
      partialFreeDeliveryEnabled: settings.partialFreeDeliveryEnabled,
      partialFreeDeliveryThreshold: settings.partialFreeDeliveryThreshold,
      partialFreeDeliveryDiscount: settings.partialFreeDeliveryDiscount,
    };
  }

  async getStoreStatus() {
    const settings = await this.getSettings();
    return {
      isOpen: settings.isStoreOpen,
      message: settings.storeClosedMessage,
    };
  }
}
