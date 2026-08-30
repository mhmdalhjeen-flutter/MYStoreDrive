import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ProductsService } from "../products/products.service";
import { DeliveryService } from "../delivery/delivery.service";
import {
  ResourceNotFoundException,
  ValidationException,
  InsufficientStockException,
} from "../../common/exceptions/business.exception";

export interface CartTotals {
  subtotal: number;
  totalItems: number;
  itemCount: number;
}

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
    private deliveryService: DeliveryService,
  ) {}

  private get baseInclude() {
    return {
      product: { include: { category: true } },
      variant: true,
    };
  }

  async getCart(userId: string, deliveryAreaId?: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: this.baseInclude,
      orderBy: { createdAt: "asc" as const },
    });

    const [totals, delivery] = await Promise.all([
      Promise.resolve(this.calculateCartTotals(cartItems as any[])),
      this.deliveryService.calculateFreeDelivery(userId, deliveryAreaId),
    ]);

    return { items: cartItems, summary: { ...totals, ...delivery } };
  }

  async getSummary(userId: string, deliveryAreaId?: string) {
    const cart = await this.getCart(userId, deliveryAreaId);
    return cart.summary;
  }

  async addToCart(
    userId: string,
    productId: string,
    quantity: number,
    variantId?: string,
  ) {
    if (!quantity || quantity < 1) {
      throw new ValidationException("Quantity must be at least 1");
    }

    const product = await this.productsService.findOneActive(productId);
    if (!product) {
      throw new ResourceNotFoundException("Product", productId);
    }

    await this.validateVariantForProduct(product, variantId);

    const isAvailable = await this.productsService.checkAvailability(
      productId,
      quantity,
      variantId,
    );
    if (!isAvailable) {
      throw new InsufficientStockException(product.name, quantity, 0);
    }

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId_variantId: {
          userId,
          productId,
          variantId: variantId || null,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      const availableForNew = await this.productsService.checkAvailability(
        productId,
        newQuantity,
        variantId,
      );
      if (!availableForNew) {
        throw new InsufficientStockException(product.name, newQuantity, 0);
      }

      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: this.baseInclude,
      });
    }

    return this.prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
        variantId: variantId || null,
      },
      include: this.baseInclude,
    });
  }

  async updateCartItem(userId: string, cartItemId: string, quantity: number) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true, variant: true },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new ResourceNotFoundException("Cart item", cartItemId);
    }

    if (quantity <= 0) {
      return this.removeFromCart(userId, cartItemId);
    }

    const isAvailable = await this.productsService.checkAvailability(
      cartItem.productId,
      quantity,
      cartItem.variantId || undefined,
    );
    if (!isAvailable) {
      throw new InsufficientStockException(
        cartItem.product.name,
        quantity,
        cartItem.variant?.stock ?? cartItem.product.stock,
      );
    }

    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: this.baseInclude,
    });
  }

  async removeFromCart(userId: string, cartItemId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new ResourceNotFoundException("Cart item", cartItemId);
    }

    return this.prisma.cartItem.delete({
      where: { id: cartItemId },
      include: this.baseInclude,
    });
  }

  async clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { userId },
    });
  }

  calculateCartTotals(cartItems: any[]): CartTotals {
    let subtotal = new Prisma.Decimal(0);
    let totalItems = 0;

    cartItems.forEach((item) => {
      const productPrice = new Prisma.Decimal(item.product.price);
      const variantAdjustment = item.variant
        ? new Prisma.Decimal(item.variant.priceAdjustment)
        : new Prisma.Decimal(0);
      const unitPrice = productPrice.plus(variantAdjustment);
      const quantity = item.quantity;

      subtotal = subtotal.plus(unitPrice.times(quantity));
      totalItems += quantity;
    });

    return {
      subtotal: subtotal.toDecimalPlaces(2).toNumber(),
      totalItems,
      itemCount: cartItems.length,
    };
  }

  private async validateVariantForProduct(product: any, variantId?: string) {
    const hasVariants = product.variants && product.variants.length > 0;

    if (hasVariants && !variantId) {
      throw new ValidationException(
        "This product requires a variant selection",
      );
    }

    if (variantId) {
      const variant = product.variants.find((v: any) => v.id === variantId);
      if (!variant) {
        throw new ResourceNotFoundException("Product variant", variantId);
      }
    }
  }
}
