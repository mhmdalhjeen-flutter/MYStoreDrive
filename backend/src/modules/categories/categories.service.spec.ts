import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrismaService } from '../prisma/prisma.service.mock';
import { ValidationException, ResourceNotFoundException } from '../../common/exceptions/business.exception';

const mockPrisma = createMockPrismaService();

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a category with a unique slug', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      mockPrisma.category.create.mockResolvedValue({ id: 'cat-1', slug: 'new-cat' });

      const result = await service.create({
        name: 'New Category',
        slug: 'new-cat',
      } as any);

      expect(result.slug).toBe('new-cat');
      expect(mockPrisma.category.create).toHaveBeenCalled();
    });

    it('should reject duplicate slug', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'existing', slug: 'dup' });

      await expect(
        service.create({ name: 'Dup', slug: 'dup' } as any),
      ).rejects.toThrow(ValidationException);
    });
  });

  describe('remove', () => {
    it('should hard delete a category with no products or children', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: 'cat-1',
        products: [],
        children: [],
      });
      mockPrisma.category.delete.mockResolvedValue({ id: 'cat-1' });

      const result = await service.remove('cat-1');

      expect(result.action).toBe('deleted');
      expect(mockPrisma.category.delete).toHaveBeenCalledWith({ where: { id: 'cat-1' } });
    });

    it('should deactivate a category referenced by products', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: 'cat-1',
        products: [{ id: 'p1' }],
        children: [],
      });
      mockPrisma.category.update.mockResolvedValue({ id: 'cat-1', isActive: false });

      const result = await service.remove('cat-1');

      expect(result.action).toBe('deactivated');
      expect(mockPrisma.category.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cat-1' },
          data: { isActive: false },
        }),
      );
    });

    it('should deactivate a category with child categories', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: 'cat-1',
        products: [],
        children: [{ id: 'child-1' }],
      });
      mockPrisma.category.update.mockResolvedValue({ id: 'cat-1', isActive: false });

      const result = await service.remove('cat-1');

      expect(result.action).toBe('deactivated');
    });
  });
});
