export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  resumeId: string;
}

export interface FileUploadResponse {
  resumeId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}