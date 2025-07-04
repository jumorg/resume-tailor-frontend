import { apiService } from './api.service';
import type { PresignedUrlResponse, FileUploadResponse, UploadProgress } from '@/types/upload.types';

class UploadService {
  async getPresignedUrl(fileName: string, fileType: string): Promise<PresignedUrlResponse> {
    return apiService.post<PresignedUrlResponse>('/api/upload/presigned-url', {
      fileName,
      fileType,
    });
  }

  async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileUploadResponse> {
    // Step 1: Get presigned URL
    const { uploadUrl, fileKey, resumeId } = await this.getPresignedUrl(
      file.name,
      file.type
    );

    // Step 2: Upload file to S3
    await apiService.uploadFile(uploadUrl, file, onProgress);

    // Step 3: Confirm upload completion
    return apiService.post<FileUploadResponse>('/api/upload/confirm', {
      resumeId,
      fileKey,
      fileName: file.name,
      fileSize: file.size,
    });
  }

  async deleteResume(resumeId: string): Promise<void> {
    await apiService.post(`/api/upload/${resumeId}/delete`);
  }
}

export const uploadService = new UploadService();