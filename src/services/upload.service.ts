import { apiService } from './api.service';
import type { PresignedUrlResponse, FileUploadResponse, UploadProgress } from '@/types/upload.types';

class UploadService {
  async getPresignedUrl(fileName: string, fileType: string) {
    // tells TS: we'll get this envelope
    const wrapper = await apiService.post<{
      success: boolean;
      data: PresignedUrlResponse;
    }>('/api/upload/presigned-url', { fileName, fileType });
    
    if (!wrapper.success) {
      throw new Error('Server returned an error generating presigned URL');
    }

    // return the inner data
    return wrapper.data;
  }

  async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileUploadResponse> {
    try {
      // Step 1: Get presigned URL
      const presignedResponse = await this.getPresignedUrl(
        file.name,
        file.type
      );
      
      // Add validation
      if (!presignedResponse?.uploadUrl) {
        throw new Error('Failed to get upload URL from server');
      }
      
      const { uploadUrl, fileKey, resumeId } = presignedResponse;

      // Step 2: Upload file to S3
      await apiService.uploadFile(uploadUrl, file, onProgress);

      // Step 3: Confirm upload completion
      return apiService.post<FileUploadResponse>('/api/upload/confirm', {
        resumeId,
        fileKey,
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      throw error; // Re-throw to be handled by useFileUpload
    }
  }
}

export const uploadService = new UploadService();