import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { mkdir, writeFile, unlink } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";
import {
  StorageProvider,
  StoredFile,
  UploadCategory,
} from "./storage.interface";

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly uploadDir: string;
  private readonly publicBaseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>("UPLOAD_DIR") || "uploads";
    this.publicBaseUrl =
      this.configService.get<string>("BACKEND_URL") || "http://localhost:3001";
  }

  async save(
    file: Express.Multer.File,
    category: UploadCategory,
    ownerId?: string,
  ): Promise<StoredFile> {
    const ext = extname(file.originalname).toLowerCase();
    const safeName = `${randomUUID()}${ext}`;
    const relativeDir = ownerId ? join(category, ownerId) : category;
    const relativePath = join(relativeDir, safeName);
    const absoluteDir = join(process.cwd(), this.uploadDir, relativeDir);
    const absolutePath = join(process.cwd(), this.uploadDir, relativePath);

    await mkdir(absoluteDir, { recursive: true });
    await writeFile(absolutePath, file.buffer);

    const key = relativePath.replace(/\\/g, "/");
    const url = `${this.publicBaseUrl}/uploads/${key}`;

    return {
      key,
      url,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async delete(key: string): Promise<void> {
    const absolutePath = join(process.cwd(), this.uploadDir, key);
    try {
      await unlink(absolutePath);
    } catch {
      // File may already be removed
    }
  }
}
