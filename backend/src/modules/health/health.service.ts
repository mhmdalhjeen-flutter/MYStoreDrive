import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "backend-api",
    };
  }

  async getDatabaseHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: "error",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      });
    }
  }
}
