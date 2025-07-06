import type { PresignedUrlResponse, FileUploadResponse, UploadProgress } from '@/types/upload.types';

class MockUploadService {
  async getPresignedUrl(fileName: string, fileType: string): Promise<PresignedUrlResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Extract file extension from fileType
    const extension = fileType.includes('pdf') ? '.pdf' : '.docx';
    const cleanFileName = fileName.replace(/\.[^/.]+$/, '') + extension;
    
    return {
      uploadUrl: 'https://mock-s3-url.com',
      fileKey: `resumes/${Date.now()}-${cleanFileName}`,
      resumeId: `resume-${Date.now()}`,
    };
  }

  async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileUploadResponse> {
    // Simulate upload progress
    const totalSteps = 10;
    for (let i = 0; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      if (onProgress) {
        onProgress({
          loaded: (file.size * i) / totalSteps,
          total: file.size,
          percentage: (i * 100) / totalSteps,
        });
      }
    }

    return {
      resumeId: `resume-${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
    };
  }

  async deleteResume(resumeId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Mock delete resume:', resumeId);
  }
}

export const uploadService = new MockUploadService();