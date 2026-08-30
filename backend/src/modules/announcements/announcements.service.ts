import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAnnouncementDto } from "./dtos/create-announcement.dto";
import { UpdateAnnouncementDto } from "./dtos/update-announcement.dto";
import { ResourceNotFoundException } from "../../common/exceptions/business.exception";

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async findActivePublic() {
    const now = new Date();
    return this.prisma.announcement.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      orderBy: [{ priority: "desc" }, { startDate: "desc" }],
    });
  }

  async findAllAdmin() {
    return this.prisma.announcement.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });
    if (!announcement) {
      throw new ResourceNotFoundException("Announcement", id);
    }
    return announcement;
  }

  async create(dto: CreateAnnouncementDto) {
    return this.prisma.announcement.create({ data: dto });
  }

  async update(id: string, dto: UpdateAnnouncementDto) {
    await this.findOne(id);
    return this.prisma.announcement.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.announcement.delete({ where: { id } });
    return { removed: true };
  }
}
