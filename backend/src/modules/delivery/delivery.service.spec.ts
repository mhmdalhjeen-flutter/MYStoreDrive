import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryService, FreeDeliveryCalculation } from './delivery.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { createMockPrismaService } from '../prisma/prisma.service.mock';

const mockPrisma = createMockPrismaService();
const mockSettingsService = {
  getDeliverySettings: jest.fn(),
};

describe('DeliveryService', () => {
  let service: DeliveryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SettingsService, useValue: mockSettingsService },
      ],
    }).compile();

    service = module.get<DeliveryService>(DeliveryService);
    jest.clearAllMocks();

    mockSettingsService.getDeliverySettings.mockResolvedValue({
      freeDeliveryTarget: 100,
      partialFreeDeliveryEnabled: true,
      partialFreeDeliveryThreshold: 50,
      partialFreeDeliveryDiscount: 50,
    });
  });

  const baseArea = {
    id: 'area-1',
    isActive: true,
    deliveryFee: 20,
    eligibleForFreeDelivery: true,
  };

  describe('exact target boundary cases', () => {
    beforeEach(() => {
      mockSettingsService.getDeliverySettings.mockResolvedValue({
        freeDeliveryTarget: 10,
        partialFreeDeliveryEnabled: true,
        partialFreeDeliveryThreshold: 7,
        partialFreeDeliveryDiscount: 50,
      });
    });

    it.each([
      [9, false, true, 1, 90],
      [10, true, false, 0, 100],
      [12, true, false, 0, 100],
      [7, false, true, 3, 70],
    ])('calculates score=%s', async (score, free, partial, remaining, progress) => {
      mockPrisma.deliveryArea.findFirst.mockResolvedValue(baseArea);
      mockPrisma.cartItem.findMany.mockResolvedValue([
        { quantity: 1, product: { freeDeliveryValue: score } },
      ]);
      const result = await service.calculateFreeDelivery('user-1', 'area-1');
      expect(result).toMatchObject({
        actualScore: score,
        displayedScore: Math.min(score, 10),
        target: 10,
        progressPercentage: progress,
        remainingScore: remaining,
        isFreeDelivery: free,
        isPartialFreeDelivery: partial,
      });
    });

    it('does not discount an ineligible area at score 12', async () => {
      mockPrisma.deliveryArea.findFirst.mockResolvedValue({
        ...baseArea,
        eligibleForFreeDelivery: false,
      });
      mockPrisma.cartItem.findMany.mockResolvedValue([
        { quantity: 1, product: { freeDeliveryValue: 12 } },
      ]);
      const result = await service.calculateFreeDelivery('user-1', 'area-1');
      expect(result).toMatchObject({
        actualScore: 12,
        displayedScore: 10,
        areaEligibility: false,
        deliveryFee: 20,
        isFreeDelivery: false,
        isPartialFreeDelivery: false,
      });
    });
  });

  describe('calculateFreeDelivery', () => {
    it('calculates actualScore from DB cart items, not from client input', async () => {
      mockPrisma.deliveryArea.findFirst.mockResolvedValue(baseArea);
      mockPrisma.cartItem.findMany.mockResolvedValue([
        { id: 'ci1', quantity: 2, product: { freeDeliveryValue: 30, price: 10 } },
        { id: 'ci2', quantity: 1, product: { freeDeliveryValue: 50, price: 15 } },
      ]);

      const result: FreeDeliveryCalculation = await service.calculateFreeDelivery(
        'user-1',
        'area-1',
      );

      expect(result.actualScore).toBe(110);
      expect(result.isFreeDelivery).toBe(true);
      expect(result.deliveryFee).toBe(0);
    });

    it('returns full free delivery when actualScore >= target', async () => {
      mockPrisma.deliveryArea.findFirst.mockResolvedValue(baseArea);
      mockPrisma.cartItem.findMany.mockResolvedValue([
        { id: 'ci1', quantity: 1, product: { freeDeliveryValue: 100, price: 10 } },
      ]);

      const result = await service.calculateFreeDelivery('user-1', 'area-1');

      expect(result.isFreeDelivery).toBe(true);
      expect(result.isPartialFreeDelivery).toBe(false);
      expect(result.deliveryFee).toBe(0);
      expect(result.deliveryDiscount).toBe(20);
      expect(result.remainingScore).toBe(0);
    });

    it('returns partial free delivery when threshold reached but target not met', async () => {
      mockPrisma.deliveryArea.findFirst.mockResolvedValue(baseArea);
      mockPrisma.cartItem.findMany.mockResolvedValue([
        { id: 'ci1', quantity: 1, product: { freeDeliveryValue: 75, price: 10 } },
      ]);

      const result = await service.calculateFreeDelivery('user-1', 'area-1');

      expect(result.isFreeDelivery).toBe(false);
      expect(result.isPartialFreeDelivery).toBe(true);
      expect(result.deliveryDiscount).toBe(10);
      expect(result.deliveryFee).toBe(10);
    });

    it('returns no discount when below partial threshold', async () => {
      mockPrisma.deliveryArea.findFirst.mockResolvedValue(baseArea);
      mockPrisma.cartItem.findMany.mockResolvedValue([
        { id: 'ci1', quantity: 1, product: { freeDeliveryValue: 20, price: 10 } },
      ]);

      const result = await service.calculateFreeDelivery('user-1', 'area-1');

      expect(result.isFreeDelivery).toBe(false);
      expect(result.isPartialFreeDelivery).toBe(false);
      expect(result.deliveryFee).toBe(20);
      expect(result.deliveryDiscount).toBe(0);
      expect(result.remainingScore).toBe(80);
    });

    it('ignores free delivery for ineligible area', async () => {
      mockPrisma.deliveryArea.findFirst.mockResolvedValue({
        ...baseArea,
        eligibleForFreeDelivery: false,
      });
      mockPrisma.cartItem.findMany.mockResolvedValue([
        { id: 'ci1', quantity: 1, product: { freeDeliveryValue: 200, price: 10 } },
      ]);

      const result = await service.calculateFreeDelivery('user-1', 'area-1');

      expect(result.areaEligibility).toBe(false);
      expect(result.isFreeDelivery).toBe(false);
      expect(result.deliveryFee).toBe(20);
    });
  });
});
