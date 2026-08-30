import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SettingsService } from "../settings/settings.service";
import { ResourceNotFoundException } from "../../common/exceptions/business.exception";
import { CreateDeliveryAreaDto } from "./dtos/create-delivery-area.dto";
import { UpdateDeliveryAreaDto } from "./dtos/update-delivery-area.dto";

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
  areaEligibility: boolean | null;
  remainingScore: number;
}

interface DeliverySettings {
  freeDeliveryTarget: Prisma.Decimal | number | string;
  partialFreeDeliveryEnabled: boolean;
  partialFreeDeliveryThreshold: Prisma.Decimal | number | string;
  partialFreeDeliveryDiscount: number;
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
      orderBy: { name: "asc" },
    });
  }

  async getAllAreas() {
    return this.prisma.deliveryArea.findMany({ orderBy: { name: "asc" } });
  }

  async getAreaById(id: string) {
    return this.prisma.deliveryArea.findUnique({ where: { id } });
  }

  async getActiveAreaById(id: string) {
    return this.prisma.deliveryArea.findFirst({
      where: { id, isActive: true },
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
    await this.requireArea(id);
    const data: any = { ...dto };
    if (dto.deliveryFee !== undefined)
      data.deliveryFee = new Prisma.Decimal(dto.deliveryFee);
    return this.prisma.deliveryArea.update({ where: { id }, data });
  }

  async setActive(id: string, isActive: boolean) {
    await this.requireArea(id);
    return this.prisma.deliveryArea.update({
      where: { id },
      data: { isActive },
    });
  }

  async remove(id: string) {
    await this.requireArea(id);
    const [addressCount, orderCount] = await Promise.all([
      this.prisma.address.count({ where: { deliveryAreaId: id } }),
      this.prisma.order.count({ where: { deliveryAreaId: id } }),
    ]);
    if (addressCount > 0 || orderCount > 0) {
      const area = await this.setActive(id, false);
      return {
        action: "deactivated",
        reason: "Delivery area is referenced and cannot be hard-deleted",
        area,
      };
    }
    await this.prisma.deliveryArea.delete({ where: { id } });
    return {
      action: "deleted",
      reason: "No references found; delivery area hard-deleted",
      areaId: id,
    };
  }

  /** Pure/reusable Decimal-safe score and fee engine. */
  calculateScoreResult(
    scoreInput: Prisma.Decimal | number | string,
    settings: DeliverySettings,
    area?: {
      deliveryFee: Prisma.Decimal | number | string;
      eligibleForFreeDelivery: boolean;
    },
  ): FreeDeliveryCalculation {
    const actualScore = new Prisma.Decimal(scoreInput);
    const target = new Prisma.Decimal(settings.freeDeliveryTarget);
    const threshold = new Prisma.Decimal(settings.partialFreeDeliveryThreshold);
    const originalFee = area
      ? new Prisma.Decimal(area.deliveryFee)
      : new Prisma.Decimal(0);
    let fee = originalFee;
    let discount = new Prisma.Decimal(0);
    let isFree = false;
    let isPartial = false;

    if (area?.eligibleForFreeDelivery) {
      if (actualScore.greaterThanOrEqualTo(target)) {
        isFree = true;
        discount = originalFee;
        fee = new Prisma.Decimal(0);
      } else if (
        settings.partialFreeDeliveryEnabled &&
        actualScore.greaterThanOrEqualTo(threshold)
      ) {
        isPartial = true;
        discount = originalFee.times(
          new Prisma.Decimal(settings.partialFreeDeliveryDiscount).div(100),
        );
        fee = originalFee.minus(discount);
      }
    }

    const displayed = Prisma.Decimal.min(actualScore, target);
    const remaining = Prisma.Decimal.max(0, target.minus(actualScore));
    const progress = target.greaterThan(0)
      ? Prisma.Decimal.min(
          100,
          actualScore.div(target).times(100),
        ).toDecimalPlaces(2)
      : new Prisma.Decimal(0);

    return {
      actualScore: actualScore.toDecimalPlaces(2).toNumber(),
      displayedScore: displayed.toDecimalPlaces(2).toNumber(),
      target: target.toNumber(),
      progressPercentage: progress.toNumber(),
      partialEnabled: settings.partialFreeDeliveryEnabled,
      partialThreshold: threshold.toNumber(),
      partialDiscount: settings.partialFreeDeliveryDiscount,
      originalDeliveryFee: originalFee.toNumber(),
      deliveryFee: fee.toDecimalPlaces(2).toNumber(),
      deliveryDiscount: discount.toDecimalPlaces(2).toNumber(),
      isFreeDelivery: isFree,
      isPartialFreeDelivery: isPartial,
      areaEligibility: area ? area.eligibleForFreeDelivery : null,
      remainingScore: remaining.toDecimalPlaces(2).toNumber(),
    };
  }

  /** Authenticated API path: score is always derived from this user's DB cart. */
  async calculateFreeDelivery(userId: string, deliveryAreaId?: string) {
    const [settings, cartItems, area] = await Promise.all([
      this.settingsService.getDeliverySettings(),
      this.prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
      }),
      deliveryAreaId
        ? this.getActiveAreaById(deliveryAreaId)
        : Promise.resolve(undefined),
    ]);
    if (deliveryAreaId && !area)
      throw new ResourceNotFoundException("Delivery area", deliveryAreaId);

    const score = cartItems.reduce(
      (sum, item) =>
        sum.plus(
          new Prisma.Decimal(item.product.freeDeliveryValue).times(
            item.quantity,
          ),
        ),
      new Prisma.Decimal(0),
    );
    return this.calculateScoreResult(score, settings, area);
  }

  private async requireArea(id: string) {
    const area = await this.getAreaById(id);
    if (!area) throw new ResourceNotFoundException("Delivery area", id);
    return area;
  }
}
