import { createWriteStream } from "fs";
import { unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../../common/errors/AppError";
import { logger } from "../../util/logger";
import { FileUpload, UploadResult, UploadService } from "./types";

export class LocalUploadService implements UploadService {
  private uploadDir: string;
  private maxFileSize: number;
  private baseUrl: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || "uploads";
    this.maxFileSize = Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;
    this.baseUrl =
      process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
  }

  async uploadFile(upload: FileUpload): Promise<UploadResult> {
    try {
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedMimeTypes.includes(upload.mimetype)) {
        throw AppError.badRequest(
          "Invalid file type. Only JPEG, PNG and WebP are allowed."
        );
      }

      // await mkdir(this.uploadDir, { recursive: true });

      const extension = path.extname(upload.filename);
      const uniqueFilename = `${uuidv4()}${extension}`;
      const filePath = path.join(this.uploadDir, uniqueFilename);

      const stream = upload.createReadStream();
      let size = 0;

      await new Promise((resolve, reject) => {
        stream
          .on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (size > this.maxFileSize) {
              reject(
                AppError.badRequest(
                  `File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`
                )
              );
            }
          })
          .pipe(createWriteStream(filePath))
          .on("error", reject)
          .on("finish", resolve);
      });

      const publicUrl = `${this.baseUrl}/uploads/${uniqueFilename}`;

      logger.info("File uploaded successfully to local storage", {
        filename: uniqueFilename,
      });

      return {
        filename: uniqueFilename,
        mimetype: upload.mimetype,
        encoding: upload.encoding,
        url: publicUrl,
      };
    } catch (error) {
      logger.error("Local file upload error:", error);
      throw error;
    }
  }

  async deleteFile(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, filename);
      await unlink(filePath);
      return true;
    } catch (error) {
      logger.error("Local file delete error:", error);
      return false;
    }
  }
}
