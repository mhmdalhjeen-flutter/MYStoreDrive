import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import {
  ResourceNotFoundException,
  ValidationException,
} from '../../common/exceptions/business.exception';
import { CreateDeliveryAreaDto } from './dtos/create-delivery-area.dto';
import { UpdateDeliveryAreaDto } from './dtos/update-delivery-area.dto';

export interface FreeDeliveryCalculation {
  actualScore: number;
  displayedScore: number;
  target: number;
  progressPercentage: number;
  partialEnabled: boolean;
  partialThreshold: number;
  partialDiscount: number;
  originalDeliveryFee: number;
  deliveryFee: number;
  deliveryDiscount: number;
  isFreeDelivery: boolean;
  isPartialFreeDelivery: boolean;
  areaEligibility: boolean;
  remainingScore: number;
}

@Injectable()
export class DeliveryService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  async getActiveAreas() {
    return this.prisma.deliveryArea.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getAreaById(id: string) {
    return this.prisma.deliveryArea.findUnique({
      where: { id },
    });
  }

  async create(dto: CreateDeliveryAreaDto) {
    return this.prisma.deliveryArea.create({
      data: {
        name: dto.name,
        nameEn: dto.nameEn,
        deliveryFee: new Prisma.Decimal(dto.deliveryFee),
        eligibleForFreeDelivery: dto.eligibleForFreeDelivery ?? true,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateDeliveryAreaDto) {
    const existing = await this.getAreaById(id);
    if (!existing) {
      throw new ResourceNotFoundException('Delivery area', id);
    }

    const data: any = { ...dto };
    if (dto.deliveryFee !== undefined) {
      data.deliveryFee = new Prisma.Decimal(dto.deliveryFee);
    }

    return this.prisma.deliveryArea.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const existing = await this.getAreaById(id);
    if (!existing) {
      throw new ResourceNotFoundException('Delivery area', id);
    }

    return this.prisma.deliveryArea.delete({ where: { id } });
  }

  async calculateFreeDelivery(
    userId: string,
    deliveryAreaId: string,
  ): Promise<FreeDeliveryCalculation> {
    const area = await this.getAreaById(deliveryAreaId);
    if (!area || !area.isActive) {
      throw new ResourceNotFoundException('Delivery area', deliveryAreaId);
    }

    const [settings, cartItems] = await Promise.all([
      this.settingsService.getDeliverySettings(),
      this.prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: true,
        },
      }),
    ]);

    if (!settings) {
      throw new ValidationException('Delivery settings are not configured');
    }

    const actualScore = cartItems.reduce((sum, item) => {
      const itemValue = new Prisma.Decimal(item.product.freeDeliveryValue ?? 0);
      return sum.plus(itemValue.times(item.quantity));
    }, new Prisma.Decimal(0));

    const target = new Prisma.Decimal(settings.freeDeliveryTarget);
    const partialThreshold = new Prisma.Decimal(settings.partialFreeDeliveryThreshold);
    const originalFee = new Prisma.Decimal(area.deliveryFee);

    let deliveryFee = originalFee;
    let deliveryDiscount = new Prisma.Decimal(0);
    let isFreeDelivery = false;
    let isPartialFreeDelivery = false;

    if (area.eligibleForFreeDelivery) {
      if (actualScore.greaterThanOrEqualTo(target)) {
        isFreeDelivery = true;
        deliveryDiscount = originalFee;
        deliveryFee = new Prisma.Decimal(0);
      } else if (
        settings.partialFreeDeliveryEnabled &&
        actualScore.greaterThanOrEqualTo(partialThreshold)
      ) {
        isPartialFreeDelivery = true;
        const discountRate = new Prisma.Decimal(settings.partialFreeDeliveryDiscount).div(100);
        deliveryDiscount = originalFee.times(discountRate);
        deliveryFee = originalFee.minus(deliveryDiscount);
      }
    }

    const displayedScore = Prisma.Decimal.min(actualScore, target);
    const remainingScore = Prisma.Decimal.max(
      new Prisma.Decimal(0),
      target.minus(actualScore),
    );

    const progressPercentage = target.greaterThan(0)
      ? actualScore.dividedBy(target).times(100).toDecimalPlaces(2).toNumber()
      : 0;

    return {
      actualScore: actualScore.toDecimalPlaces(2).toNumber(),
      displayedScore: displayedScore.toDecimalPlaces(2).toNumber(),
      target: target.toNumber(),
      progressPercentage: Math.min(progressPercentage, 100),
      partialEnabled: settings.partialFreeDeliveryEnabled,
      partialThreshold: partialThreshold.toNumber(),
      partialDiscount: settings.partialFreeDeliveryDiscount,
      originalDeliveryFee: originalFee.toNumber(),
      deliveryFee: deliveryFee.toNumber(),
      deliveryDiscount: deliveryDiscount.toDecimalPlaces(2).toNumber(),
      isFreeDelivery,
      isPartialFreeDelivery,
      areaEligibility: area.eligibleForFreeDelivery,
      remainingScore: remainingScore.toDecimalPlaces(2).toNumber(),
    };
  }
}
