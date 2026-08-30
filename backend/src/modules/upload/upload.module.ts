import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UploadService } from "./upload.service";
import { UploadController } from "./upload.controller";
import { LocalStorageProvider } from "./storage/local-storage.provider";
import { STORAGE_PROVIDER } from "./storage/storage.interface";

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [
    UploadService,
    LocalStorageProvider,
    {
      provide: STORAGE_PROVIDER,
      useFactory: (config: ConfigService, local: LocalStorageProvider) => {
        const provider = config.get<string>("STORAGE_PROVIDER", "local");

        if (provider === "local") {
          return local;
        }

        if (provider === "r2") {
          throw new Error(
            "STORAGE_PROVIDER=r2 is reserved for production object storage. " +
              "Configure R2 credentials and implement R2StorageProvider before enabling.",
          );
        }

        throw new Error(`Unknown STORAGE_PROVIDER: ${provider}`);
      },
      inject: [ConfigService, LocalStorageProvider],
    },
  ],
  exports: [UploadService],
})
export class UploadModule {}
