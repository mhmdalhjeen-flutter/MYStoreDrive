import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ProductsService } from "../products/products.service";
import { ResourceNotFoundException } from "../../common/exceptions/business.exception";

@Injectable()
export class FavoritesService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true, variants: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async add(userId: string, productId: string) {
    const product = await this.productsService.findOneActive(productId);
    if (!product) {
      throw new ResourceNotFoundException("Product", productId);
    }

    return this.prisma.favorite.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
      include: { product: true },
    });
  }

  async remove(userId: string, productId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (!favorite) {
      throw new ResourceNotFoundException("Favorite", productId);
    }

    await this.prisma.favorite.delete({
      where: { userId_productId: { userId, productId } },
    });

    return { removed: true };
  }

  async isFavorite(userId: string, productId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return { isFavorite: !!favorite };
  }
}
