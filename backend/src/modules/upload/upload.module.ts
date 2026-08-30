import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { LocalStorageProvider } from './storage/local-storage.provider';
import { STORAGE_PROVIDER } from './storage/storage.interface';

@Module({
  controllers: [UploadController],
  providers: [
    UploadService,
    LocalStorageProvider,
    {
      provide: STORAGE_PROVIDER,
      useExisting: LocalStorageProvider,
    },
  ],
  exports: [UploadService],
})
export class UploadModule {}
