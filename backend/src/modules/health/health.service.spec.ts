import { Test, TestingModule } from '@nestjs/testing';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrismaService } from '../prisma/prisma.service.mock';

const mockPrisma = { ...createMockPrismaService(), $queryRaw: jest.fn() };

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<HealthService>(HealthService);
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  describe('check', () => {
    it('should report the api as alive without touching the database', () => {
      const result = service.check();

      expect(result.status).toBe('ok');
      expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
    });
  });

  describe('checkDatabase', () => {
    it('should report the database as up when the query succeeds', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      await expect(service.checkDatabase()).resolves.toMatchObject({
        status: 'ok',
        database: 'up',
      });
    });

    it('should not leak connection details when the query fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(
        new Error('connect ECONNREFUSED postgresql://user:password@db.example.com:5432'),
      );

      await expect(service.checkDatabase()).rejects.toThrow(ServiceUnavailableException);
      await expect(service.checkDatabase()).rejects.toThrow('Database unavailable');
    });
  });
});
