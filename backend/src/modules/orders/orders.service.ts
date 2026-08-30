import { Injectable } from "@nestjs/common";
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  ProductAvailability,
} from "@prisma/client";
import { randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { CartService } from "../cart/cart.service";
import { DeliveryService } from "../delivery/delivery.service";
import { SettingsService } from "../settings/settings.service";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { UpdateOrderStatusDto } from "./dtos/update-order-status.dto";
import { SubmitPaymentDto } from "./dtos/submit-payment.dto";
import { AdminPaymentActionDto } from "./dtos/admin-payment-action.dto";
import {
  InsufficientStockException,
  ResourceNotFoundException,
  StoreClosedException,
  ValidationException,
} from "../../common/exceptions/business.exception";

type CartItemWithRelations = Prisma.CartItemGetPayload<{
  include: {
    product: { include: { variants: true } };
    variant: true;
  };
}>;

const orderInclude = {
  items: { include: { product: true } },
  deliveryArea: true,
  customer: {
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      email: true,
    },
  },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private deliveryService: DeliveryService,
    private settingsService: SettingsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const storeStatus = await this.settingsService.getStoreStatus();
    if (!storeStatus.isOpen) {
      throw new StoreClosedException(
        storeStatus.message || "المتجر مغلق حالياً",
      );
    }

    const area = await this.deliveryService.getActiveAreaById(
      dto.deliveryAreaId,
    );
    if (!area) {
      throw new ResourceNotFoundException("Delivery area", dto.deliveryAreaId);
    }

    if (!dto.deliveryAddress?.trim()) {
      throw new ValidationException("Delivery address is required");
    }

    return this.prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: {
          product: { include: { variants: true } },
          variant: true,
        },
        orderBy: { createdAt: "asc" },
      });

      if (cartItems.length === 0) {
        throw new ValidationException("Cart is empty");
      }

      for (const item of cartItems) {
        this.assertPurchasable(item);
      }

      for (const item of cartItems) {
        await this.deductStock(tx, item);
      }

      const totals = this.cartService.calculateCartTotals(cartItems);
      const deliverySettings = await this.settingsService.getDeliverySettings();
      const score = cartItems.reduce(
        (sum, item) =>
          sum.plus(
            new Prisma.Decimal(item.product.freeDeliveryValue).times(
              item.quantity,
            ),
          ),
        new Prisma.Decimal(0),
      );
      const delivery = this.deliveryService.calculateScoreResult(
        score,
        deliverySettings,
        area,
      );

      const subtotal = new Prisma.Decimal(totals.subtotal);
      const deliveryFee = new Prisma.Decimal(delivery.deliveryFee);
      const total = subtotal.plus(deliveryFee);
      const orderNumber = this.generateOrderNumber();

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: userId,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          subtotal,
          deliveryFee,
          total,
          cartScore: new Prisma.Decimal(delivery.actualScore),
          deliveryAreaId: dto.deliveryAreaId,
          deliveryAddress: dto.deliveryAddress.trim(),
          notes: dto.notes?.trim() || null,
          items: {
            create: cartItems.map((item) => this.buildOrderItemSnapshot(item)),
          },
        },
        include: orderInclude,
      });

      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });
  }

  async findAllForCustomer(userId: string) {
    return this.prisma.order.findMany({
      where: { customerId: userId },
      include: {
        items: true,
        deliveryArea: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOneForCustomer(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId: userId },
      include: orderInclude,
    });

    if (!order) {
      throw new ResourceNotFoundException("Order", orderId);
    }

    return order;
  }

  async findAllAdmin() {
    return this.prisma.order.findMany({
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  async findOneAdmin(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });

    if (!order) {
      throw new ResourceNotFoundException("Order", orderId);
    }

    return order;
  }

  async updateStatusAdmin(orderId: string, dto: UpdateOrderStatusDto) {
    await this.findOneAdmin(orderId);

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: dto.status,
        adminPaymentNotes: dto.adminNotes?.trim() || undefined,
      },
      include: orderInclude,
    });
  }

  async submitPayment(userId: string, orderId: string, dto: SubmitPaymentDto) {
    const order = await this.findOneForCustomer(userId, orderId);

    const canSubmit =
      order.status === OrderStatus.PENDING &&
      order.paymentStatus === PaymentStatus.PENDING;

    const canResubmit =
      order.status === OrderStatus.PAYMENT_REJECTED &&
      order.paymentStatus === PaymentStatus.REJECTED;

    if (!canSubmit && !canResubmit) {
      throw new ValidationException(
        "Payment cannot be submitted for this order in its current state",
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAYMENT_SUBMITTED,
        paymentStatus: PaymentStatus.SUBMITTED,
        paymentReference: dto.paymentReference.trim(),
        paymentNotes: dto.paymentNotes?.trim() || null,
        paymentProof: dto.paymentProof?.trim() || null,
      },
      include: orderInclude,
    });
  }

  async verifyPaymentAdmin(orderId: string, dto: AdminPaymentActionDto) {
    const order = await this.findOneAdmin(orderId);

    if (
      order.status !== OrderStatus.PAYMENT_SUBMITTED ||
      order.paymentStatus !== PaymentStatus.SUBMITTED
    ) {
      throw new ValidationException("Only submitted payments can be verified");
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.VERIFIED,
        adminPaymentNotes: dto.adminPaymentNotes?.trim() || null,
      },
      include: orderInclude,
    });
  }

  async rejectPaymentAdmin(orderId: string, dto: AdminPaymentActionDto) {
    const order = await this.findOneAdmin(orderId);

    if (
      order.status !== OrderStatus.PAYMENT_SUBMITTED ||
      order.paymentStatus !== PaymentStatus.SUBMITTED
    ) {
      throw new ValidationException("Only submitted payments can be rejected");
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAYMENT_REJECTED,
        paymentStatus: PaymentStatus.REJECTED,
        adminPaymentNotes: dto.adminPaymentNotes?.trim() || null,
      },
      include: orderInclude,
    });
  }

  private assertPurchasable(item: CartItemWithRelations) {
    const product = item.product;

    if (!product.isActive || !product.isAvailable) {
      throw new ValidationException(
        `Product '${product.name}' is no longer available`,
      );
    }

    if (product.availability === ProductAvailability.UNAVAILABLE) {
      throw new ValidationException(
        `Product '${product.name}' cannot be purchased`,
      );
    }

    const hasVariants = product.variants.length > 0;
    if (hasVariants && !item.variantId) {
      throw new ValidationException(
        `Product '${product.name}' requires a variant selection`,
      );
    }

    if (item.variantId && !item.variant) {
      throw new ResourceNotFoundException("Product variant", item.variantId);
    }
  }

  private async deductStock(
    tx: Prisma.TransactionClient,
    item: CartItemWithRelations,
  ) {
    const product = item.product;

    if (product.availability === ProductAvailability.UNLIMITED) {
      return;
    }

    if (product.availability !== ProductAvailability.LIMITED) {
      throw new ValidationException(
        `Product '${product.name}' cannot be purchased`,
      );
    }

    if (item.variantId) {
      const updated = await tx.productVariant.updateMany({
        where: {
          id: item.variantId,
          productId: product.id,
          stock: { gte: item.quantity },
        },
        data: { stock: { decrement: item.quantity } },
      });

      if (updated.count === 0) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });
        throw new InsufficientStockException(
          product.name,
          item.quantity,
          variant?.stock ?? 0,
        );
      }
      return;
    }

    const updated = await tx.product.updateMany({
      where: {
        id: product.id,
        availability: ProductAvailability.LIMITED,
        isActive: true,
        isAvailable: true,
        stock: { gte: item.quantity },
      },
      data: { stock: { decrement: item.quantity } },
    });

    if (updated.count === 0) {
      const fresh = await tx.product.findUnique({ where: { id: product.id } });
      throw new InsufficientStockException(
        product.name,
        item.quantity,
        fresh?.stock ?? 0,
      );
    }
  }

  buildOrderItemSnapshot(
    item: CartItemWithRelations,
  ): Prisma.OrderItemCreateWithoutOrderInput {
    const productPrice = new Prisma.Decimal(item.product.price);
    const variantAdjustment = item.variant
      ? new Prisma.Decimal(item.variant.priceAdjustment)
      : new Prisma.Decimal(0);
    const unitPrice = productPrice.plus(variantAdjustment);

    return {
      product: { connect: { id: item.productId } },
      productName: item.product.name,
      quantity: item.quantity,
      price: unitPrice,
      freeDeliveryValue: new Prisma.Decimal(item.product.freeDeliveryValue),
      variantInfo: item.variant
        ? JSON.stringify({
            id: item.variant.id,
            name: item.variant.name,
            value: item.variant.value,
            type: item.variant.type,
            priceAdjustment: item.variant.priceAdjustment.toString(),
          })
        : null,
    };
  }

  private generateOrderNumber(): string {
    const now = new Date();
    const datePart = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
      String(now.getSeconds()).padStart(2, "0"),
    ].join("");
    const suffix = randomBytes(3).toString("hex").toUpperCase();
    return `ORD-${datePart}-${suffix}`;
  }
}
