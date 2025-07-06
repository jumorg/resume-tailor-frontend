import { useState, useCallback, useRef } from 'react';
import { uploadService } from '@/services/upload.service';
import type { UploadProgress } from '@/types/upload.types';

export interface FileUploadState {
  file: File | null;
  preview: string | null;
  error: string | null;
  isLoading: boolean;
  uploadProgress: number;
  resumeId: string | null;
}

const ACCEPTED_TYPES = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const useFileUpload = () => {
  const [state, setState] = useState<FileUploadState>({
    file: null,
    preview: null,
    error: null,
    isLoading: false,
    uploadProgress: 0,
    resumeId: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const validateFile = (file: File): string | null => {
    if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) {
      return 'Please upload a PDF or DOCX file';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    return null;
  };

  // Modified: Only validates and stores file locally, doesn't upload
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    
    if (error) {
      setState({
        file: null,
        preview: null,
        error,
        isLoading: false,
        uploadProgress: 0,
        resumeId: null,
      });
      return;
    }

    // Just store the file locally
    setState({
      file,
      preview: file.name,
      error: null,
      isLoading: false,
      uploadProgress: 0,
      resumeId: null,
    });
  }, []);

  // New method: Upload the stored file to S3
  const uploadFile = useCallback(async (): Promise<string | null> => {
    if (!state.file) {
      setState(prev => ({ ...prev, error: 'No file selected' }));
      return null;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      uploadProgress: 0,
      error: null,
    }));

    try {
      abortControllerRef.current = new AbortController();

      const handleProgress = (progress: UploadProgress) => {
        setState(prev => ({
          ...prev,
          uploadProgress: progress.percentage,
        }));
      };

      const response = await uploadService.uploadFile(state.file, handleProgress);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        uploadProgress: 100,
        resumeId: response.resumeId,
      }));

      return response.resumeId;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setState(prev => ({
          ...prev,
          error: 'Upload cancelled',
          isLoading: false,
          uploadProgress: 0,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Upload failed',
          isLoading: false,
          uploadProgress: 0,
        }));
      }
      return null;
    }
  }, [state.file]);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearFile = useCallback(async () => {
    // Only delete from S3 if it was actually uploaded
    if (state.resumeId) {
      try {
        await uploadService.deleteResume(state.resumeId);
      } catch (error) {
        console.error('Failed to delete resume:', error);
      }
    }

    setState({
      file: null,
      preview: null,
      error: null,
      isLoading: false,
      uploadProgress: 0,
      resumeId: null,
    });
  }, [state.resumeId]);

  const retryUpload = useCallback(() => {
    if (state.file) {
      uploadFile();
    }
  }, [state.file, uploadFile]);

  return {
    ...state,
    handleFileSelect,
    uploadFile, // New method exposed
    clearFile,
    cancelUpload,
    retryUpload,
  };
};