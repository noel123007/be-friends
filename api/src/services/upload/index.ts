import { LocalUploadService } from "./local";
import { S3UploadService } from "./s3";
import { UploadService } from "./types";

export function createUploadService(): UploadService {
  const uploadType = process.env.UPLOAD_SERVICE || "local";

  switch (uploadType) {
    case "local":
      return new LocalUploadService();
    case "s3":
      return new S3UploadService();
    default:
      return new LocalUploadService();
  }
}

export const uploadService = createUploadService();
export * from "./types";
