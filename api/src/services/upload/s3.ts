import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../../common/errors/AppError";
import { logger } from "../../util/logger";
import { FileUpload, UploadResult, UploadService } from "./types";

export class S3UploadService implements UploadService {
  private s3Client: S3Client;
  private bucket: string;
  private region: string;
  private maxFileSize: number;
  private uploadFolder: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || "";
    this.region = process.env.AWS_REGION || "us-east-1";
    this.maxFileSize = Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;
    this.uploadFolder = process.env.AWS_S3_BUCKET || "uploads";

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });
  }

  async uploadFile(upload: FileUpload): Promise<UploadResult> {
    try {
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedMimeTypes.includes(upload.mimetype)) {
        throw AppError.badRequest(
          "Invalid file type. Only JPEG, PNG and WebP are allowed."
        );
      }

      const chunks: Buffer[] = [];
      let size = 0;
      const stream = upload.createReadStream();

      for await (const chunk of stream) {
        size += chunk.length;
        if (size > this.maxFileSize) {
          throw AppError.badRequest(
            `File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`
          );
        }
        chunks.push(chunk as Buffer);
      }

      const buffer = Buffer.concat(chunks);
      const extension = upload.filename.split(".").pop()?.toLowerCase();
      const uniqueFilename = `${uuidv4()}.${extension}`;
      const key = `${uniqueFilename}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: upload.mimetype,
        ContentDisposition: "attachment",
      });

      await this.s3Client.send(command);

      // Generate URL
      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

      logger.info("File uploaded successfully to S3", {
        filename: uniqueFilename,
        bucket: this.bucket,
        key,
      });

      return {
        filename: uniqueFilename,
        mimetype: upload.mimetype,
        encoding: upload.encoding,
        url,
      };
    } catch (error) {
      logger.error("S3 upload error:", error);
      throw error;
    }
  }

  async deleteFile(filename: string): Promise<boolean> {
    try {
      const key = `${this.uploadFolder}/${filename}`;
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      logger.error("S3 delete error:", error);
      return false;
    }
  }
}
