export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string; 
  createReadStream: () => NodeJS.ReadableStream;
}

export interface UploadResult {
  filename: string;
  mimetype: string;
  encoding: string;
  url: string;
}

export interface UploadService {
  uploadFile: (file: FileUpload) => Promise<UploadResult>;
  deleteFile: (filename: string) => Promise<boolean>;
}
