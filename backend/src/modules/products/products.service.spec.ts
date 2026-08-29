import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrismaService } from '../prisma/prisma.service.mock';
import { ResourceNotFoundException, ValidationException } from '../../common/exceptions/business.exception';
import { ProductAvailability } from '@prisma/client';

const mockPrisma = createMockPrismaService();

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product with variants', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat-1', isActive: true });
      mockPrisma.product.create.mockResolvedValue({ id: 'prod-1' });

      const dto = {
        name: 'Product',
        description: 'Desc',
        categoryId: 'cat-1',
        price: 100,
        availability: ProductAvailability.UNLIMITED,
        variants: [
          { name: 'Red', value: '#f00', type: 'color', stock: 5 },
        ],
      } as any;

      const result = await service.create(dto);

      expect(result.id).toBe('prod-1');
      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Product',
            price: new Prisma.Decimal(100),
            categoryId: 'cat-1',
            variants: {
              create: [expect.objectContaining({ name: 'Red', stock: 5 })],
            },
          }),
          include: expect.anything(),
        }),
      );
    });

    it('should reject creation when category is missing', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          name: 'P',
          description: 'D',
          categoryId: 'missing',
          price: 10,
          availability: ProductAvailability.UNLIMITED,
        } as any),
      ).rejects.toThrow(ResourceNotFoundException);
    });

    it('should reject limited product without stock >= 0', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'cat-1' });

      await expect(
        service.create({
          name: 'P',
          description: 'D',
          categoryId: 'cat-1',
          price: 10,
          availability: ProductAvailability.LIMITED,
          stock: -1,
        } as any),
      ).rejects.toThrow(ValidationException);
    });
  });

  describe('remove', () => {
    it('should hard delete a product with no references', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        availability: ProductAvailability.UNLIMITED,
      });
      mockPrisma.cartItem.count.mockResolvedValue(0);
      mockPrisma.orderItem.count.mockResolvedValue(0);
      mockPrisma.product.delete.mockResolvedValue({ id: 'prod-1' });

      const result = await service.remove('prod-1');

      expect(result.action).toBe('deleted');
      expect(mockPrisma.product.delete).toHaveBeenCalledWith({ where: { id: 'prod-1' } });
    });

    it('should deactivate a product referenced in a cart', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'prod-1',
        availability: ProductAvailability.UNLIMITED,
      });
      mockPrisma.cartItem.count.mockResolvedValue(1);
      mockPrisma.orderItem.count.mockResolvedValue(0);
      mockPrisma.product.update.mockResolvedValue({ id: 'prod-1', isActive: false });

      const result = await service.remove('prod-1');

      expect(result.action).toBe('deactivated');
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
          data: { isActive: false, isAvailable: false },
        }),
      );
    });
  });

  describe('checkAvailability', () => {
    const baseProduct = {
      id: 'p1',
      isActive: true,
      isAvailable: true,
      variants: [{ id: 'v1', stock: 3 }],
    };

    it('should return false for UNAVAILABLE products', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        ...baseProduct,
        availability: ProductAvailability.UNAVAILABLE,
      });

      const result = await service.checkAvailability('p1', 1);
      expect(result).toBe(false);
    });

    it('should ignore stock for UNLIMITED products', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        ...baseProduct,
        availability: ProductAvailability.UNLIMITED,
      });

      const result = await service.checkAvailability('p1', 1000);
      expect(result).toBe(true);
    });

    it('should enforce stock for LIMITED products', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        ...baseProduct,
        availability: ProductAvailability.LIMITED,
        stock: 5,
      });

      expect(await service.checkAvailability('p1', 5)).toBe(true);
      expect(await service.checkAvailability('p1', 6)).toBe(false);
    });

    it('should enforce variant stock when variantId is provided', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        ...baseProduct,
        availability: ProductAvailability.LIMITED,
        stock: 100,
      });

      expect(await service.checkAvailability('p1', 3, 'v1')).toBe(true);
      expect(await service.checkAvailability('p1', 4, 'v1')).toBe(false);
    });
  });
});
