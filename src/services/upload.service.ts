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
      const wrapper = await apiService.post<{
        success: boolean;
        data: FileUploadResponse;
      }>('/api/upload/confirm', {
        resumeId,
        fileKey,
        fileName: file.name,
        fileSize: file.size,
      });

      if (!wrapper.success) {
        throw new Error('Failed to confirm upload');
      }

      return wrapper.data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error; // Re-throw to be handled by useFileUpload
    }
  }

  async deleteResume(resumeId: string): Promise<void> {
    try {
      // Comment out or remove this if you haven't implemented the backend endpoint yet
      // await apiService.delete(`/api/resume/${resumeId}`);
      
      // For now, just log it
      console.log('Delete resume called for:', resumeId);
      // In production, you'd want to actually delete from S3
    } catch (error) {
      console.error('Failed to delete resume:', error);
      // Don't throw the error if delete isn't critical
    }
  }
}

export const uploadService = new UploadService();