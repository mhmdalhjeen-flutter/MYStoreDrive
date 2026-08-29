import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ResourceNotFoundException,
  ValidationException,
} from '../../common/exceptions/business.exception';
import { CreateProductDto, CreateVariantDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private get baseInclude() {
    return {
      category: true,
      variants: true,
    };
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
    includeInactive?: boolean;
  }) {
    const { skip, take, where, orderBy, includeInactive } = params;

    const publicWhere = includeInactive
      ? where
      : {
          ...where,
          isActive: true,
          isAvailable: true,
        };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take,
        where: publicWhere,
        orderBy,
        include: this.baseInclude,
      }),
      this.prisma.product.count({ where: publicWhere }),
    ]);

    return {
      products,
      total,
      page: take ? Math.floor(skip / take) + 1 : 1,
      pageSize: take,
    };
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: this.baseInclude,
    });
  }

  async findOneActive(id: string) {
    return this.prisma.product.findFirst({
      where: {
        id,
        isActive: true,
        isAvailable: true,
      },
      include: this.baseInclude,
    });
  }

  async findRecommended() {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        isAvailable: true,
        isRecommended: true,
      },
      include: { category: true },
    });
  }

  async findOffers() {
    const now = new Date();
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        isAvailable: true,
        hasOffer: true,
        offerStartDate: { lte: now },
        OR: [{ offerEndDate: null }, { offerEndDate: { gte: now } }],
      },
      include: { category: true },
    });
  }

  async search(query: string) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        isAvailable: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { nameEn: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
      include: { category: true },
    });
  }

  async create(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new ResourceNotFoundException('Category', dto.categoryId);
    }

    this.validateAvailabilityStock(dto.availability, dto.stock);

    const data: any = {
      name: dto.name,
      nameEn: dto.nameEn,
      description: dto.description,
      descriptionEn: dto.descriptionEn,
      categoryId: dto.categoryId,
      price: new Prisma.Decimal(dto.price),
      freeDeliveryValue: new Prisma.Decimal(dto.freeDeliveryValue ?? 0),
      availability: dto.availability,
      stock: dto.stock ?? 0,
      isAvailable: dto.isAvailable ?? true,
      isRecommended: dto.isRecommended ?? false,
      condition: dto.condition,
      tags: dto.tags ?? [],
      images: dto.images ?? [],
    };

    if (dto.variants?.length) {
      data.variants = {
        create: dto.variants.map((variant) => this.mapVariantInput(variant)),
      };
    }

    return this.prisma.product.create({
      data,
      include: this.baseInclude,
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new ResourceNotFoundException('Product', id);
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new ResourceNotFoundException('Category', dto.categoryId);
      }
    }

    this.validateAvailabilityStock(
      dto.availability ?? existing.availability,
      dto.stock ?? existing.stock,
    );

    const data: any = { ...dto };
    if (dto.price !== undefined) {
      data.price = new Prisma.Decimal(dto.price);
    }
    if (dto.freeDeliveryValue !== undefined) {
      data.freeDeliveryValue = new Prisma.Decimal(dto.freeDeliveryValue);
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: this.baseInclude,
    });
  }

  async deactivate(id: string) {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new ResourceNotFoundException('Product', id);
    }

    return this.prisma.product.update({
      where: { id },
      data: { isActive: false, isAvailable: false },
      include: this.baseInclude,
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new ResourceNotFoundException('Product', id);
    }

    const [cartItemsCount, orderItemsCount] = await Promise.all([
      this.prisma.cartItem.count({ where: { productId: id } }),
      this.prisma.orderItem.count({ where: { productId: id } }),
    ]);

    if (cartItemsCount > 0 || orderItemsCount > 0) {
      const deactivated = await this.deactivate(id);
      return {
        action: 'deactivated',
        reason: 'Product is referenced by cart items or order items and cannot be hard-deleted',
        product: deactivated,
      };
    }

    await this.prisma.product.delete({ where: { id } });
    return {
      action: 'deleted',
      reason: 'No references found; product hard-deleted',
      productId: id,
    };
  }

  async checkAvailability(
    productId: string,
    quantity: number,
    variantId?: string,
  ): Promise<boolean> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product || !product.isActive || !product.isAvailable) {
      return false;
    }

    if (product.availability === 'UNAVAILABLE') {
      return false;
    }

    if (product.availability === 'UNLIMITED') {
      return true;
    }

    if (product.availability === 'LIMITED') {
      if (variantId) {
        const variant = product.variants.find((v) => v.id === variantId);
        if (!variant) return false;
        return variant.stock >= quantity;
      }
      return product.stock >= quantity;
    }

    return false;
  }

  private validateAvailabilityStock(
    availability: string | undefined,
    stock: number | undefined,
  ) {
    if (availability === 'LIMITED' && (stock === undefined || stock < 0)) {
      throw new ValidationException('Limited products must have a stock quantity >= 0');
    }
  }

  private mapVariantInput(variant: CreateVariantDto) {
    return {
      name: variant.name,
      value: variant.value,
      type: variant.type,
      priceAdjustment: new Prisma.Decimal(variant.priceAdjustment ?? 0),
      stock: variant.stock ?? 0,
    };
  }
}
