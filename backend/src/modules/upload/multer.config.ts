import { memoryStorage } from "multer";

/** Shared Multer limits — must stay aligned with UploadService MAX_FILE_SIZE env default. */
export function getMaxUploadBytes(): number {
  return parseInt(process.env.MAX_FILE_SIZE ?? "5242880", 10);
}

export function createUploadMulterOptions() {
  return {
    storage: memoryStorage(),
    limits: { fileSize: getMaxUploadBytes(), files: 1 },
  };
}
