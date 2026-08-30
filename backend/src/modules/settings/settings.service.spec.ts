import { Test, TestingModule } from "@nestjs/testing";
import { Prisma } from "@prisma/client";
import { SettingsService } from "./settings.service";
import { PrismaService } from "../prisma/prisma.service";
import { createMockPrismaService } from "../prisma/prisma.service.mock";
import { ValidationException } from "../../common/exceptions/business.exception";

const mockPrisma = createMockPrismaService();

describe("SettingsService", () => {
  let service: SettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    jest.clearAllMocks();
  });

  describe("getSettings", () => {
    it("should create default settings if none exist", async () => {
      mockPrisma.settings.findFirst.mockResolvedValue(null);
      mockPrisma.settings.create.mockResolvedValue({
        id: "default",
        storeName: "متجر",
        freeDeliveryTarget: new Prisma.Decimal(10),
        partialFreeDeliveryThreshold: new Prisma.Decimal(5),
        partialFreeDeliveryDiscount: 50,
      });

      const result = await service.getSettings();

      expect(result.storeName).toBe("متجر");
      expect(mockPrisma.settings.create).toHaveBeenCalled();
    });
  });

  describe("updateSettings", () => {
    it("should accept partial threshold strictly less than target", async () => {
      mockPrisma.settings.findFirst.mockResolvedValue({
        id: "default",
        freeDeliveryTarget: new Prisma.Decimal(10),
        partialFreeDeliveryThreshold: new Prisma.Decimal(5),
        partialFreeDeliveryDiscount: 50,
        partialFreeDeliveryEnabled: true,
      });
      mockPrisma.settings.update.mockResolvedValue({});

      const result = await service.updateSettings({
        freeDeliveryTarget: 20,
        partialFreeDeliveryThreshold: 10,
      });

      expect(result).toBeDefined();
      expect(mockPrisma.settings.update).toHaveBeenCalled();
    });

    it("should reject partial threshold equal to target", async () => {
      mockPrisma.settings.findFirst.mockResolvedValue({
        id: "default",
        freeDeliveryTarget: new Prisma.Decimal(10),
        partialFreeDeliveryThreshold: new Prisma.Decimal(5),
        partialFreeDeliveryDiscount: 50,
        partialFreeDeliveryEnabled: true,
      });

      await expect(
        service.updateSettings({
          freeDeliveryTarget: 10,
          partialFreeDeliveryThreshold: 10,
        }),
      ).rejects.toThrow(ValidationException);
    });

    it("should reject partial threshold greater than target", async () => {
      mockPrisma.settings.findFirst.mockResolvedValue({
        id: "default",
        freeDeliveryTarget: new Prisma.Decimal(10),
        partialFreeDeliveryThreshold: new Prisma.Decimal(5),
        partialFreeDeliveryDiscount: 50,
        partialFreeDeliveryEnabled: true,
      });

      await expect(
        service.updateSettings({ partialFreeDeliveryThreshold: 15 }),
      ).rejects.toThrow(ValidationException);
    });
  });
});
