import { Injectable } from '@nestjs/common';
import {
  OrderStatus,
  PaymentStatus,
  ProductAvailability,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      ordersToday,
      totalCustomers,
      productCount,
      availableProducts,
      outOfStockProducts,
      revenueAggregate,
      averageOrderValue,
      pendingPayments,
      confirmedOrders,
      rejectedPayments,
      favoritesCount,
      unreadSupport,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.product.count(),
      this.prisma.product.count({
        where: {
          isActive: true,
          isAvailable: true,
          availability: { not: ProductAvailability.UNAVAILABLE },
        },
      }),
      this.prisma.product.count({
        where: {
          isActive: true,
          availability: ProductAvailability.LIMITED,
          stock: 0,
        },
      }),
      this.prisma.order.aggregate({
        where: {
          paymentStatus: PaymentStatus.VERIFIED,
          status: {
            in: [
              OrderStatus.CONFIRMED,
              OrderStatus.PROCESSING,
              OrderStatus.SHIPPED,
              OrderStatus.DELIVERED,
            ],
          },
        },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.VERIFIED },
        _avg: { total: true },
      }),
      this.prisma.order.count({ where: { paymentStatus: PaymentStatus.SUBMITTED } }),
      this.prisma.order.count({
        where: {
          status: {
            in: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
          },
        },
      }),
      this.prisma.order.count({ where: { paymentStatus: PaymentStatus.REJECTED } }),
      this.prisma.favorite.count(),
      this.prisma.supportMessage.count({ where: { isAdmin: false, isRead: false } }),
    ]);

    return {
      totalOrders,
      ordersToday,
      totalCustomers,
      productCount,
      availableProducts,
      outOfStockProducts,
      totalRevenue: revenueAggregate._sum.total
        ? new Prisma.Decimal(revenueAggregate._sum.total).toNumber()
        : 0,
      averageOrderValue: averageOrderValue._avg.total
        ? new Prisma.Decimal(averageOrderValue._avg.total).toNumber()
        : 0,
      pendingPayments,
      confirmedOrders,
      rejectedPayments,
      favoritesCount,
      unreadSupport,
    };
  }
}
