import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileUploadZone } from '@/components/upload/FileUploadZone';
import { FileUploadProgress } from '@/components/upload/FileUploadProgress';
import { JobDescriptionInput } from '@/components/upload/JobDescriptionInput';
import { TailoringProgress } from '@/components/tailoring/TailoringProgress';
import { TailoringError } from '@/components/tailoring/TailoringError';
import { Button } from '@/components/common/Button';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useTailoring } from '@/hooks/useTailoring';

export const Dashboard: React.FC = () => {
  const resumeUpload = useFileUpload();
  const workHistoryUpload = useFileUpload();
  const [jobDescription, setJobDescription] = useState('');
  const [jobDescriptionError, setJobDescriptionError] = useState<string | null>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  
  const { startTailoring, cancelTailoring, retryTailoring, isLoading, error, status } = useTailoring({
    onError: (error) => {
      console.error('Tailoring failed:', error);
    },
  });

  const validateForm = (): boolean => {
    let isValid = true;

    if (!resumeUpload.file) {
      resumeUpload.handleFileSelect(new File([], ''));
      isValid = false;
    }

    if (!jobDescription.trim()) {
      setJobDescriptionError('Job description is required');
      isValid = false;
    } else if (jobDescription.trim().length < 50) {
      setJobDescriptionError('Job description must be at least 50 characters');
      isValid = false;
    } else {
      setJobDescriptionError(null);
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsUploadingFiles(true);

    try {
      // Upload resume file
      const resumeId = await resumeUpload.uploadFile();
      if (!resumeId) {
        setIsUploadingFiles(false);
        return;
      }

      // Upload work history if provided
      let workHistoryId: string | undefined;
      if (workHistoryUpload.file) {
        workHistoryId = await workHistoryUpload.uploadFile() || undefined;
      }

      setIsUploadingFiles(false);

      // Start tailoring with the uploaded IDs
      await startTailoring({
        resumeId,
        workHistoryId,
        jobDescription,
      });
    } catch (error) {
      setIsUploadingFiles(false);
      console.error('Upload failed:', error);
    }
  };

  const handleCancel = () => {
    if (isUploadingFiles) {
      resumeUpload.cancelUpload();
      workHistoryUpload.cancelUpload();
      setIsUploadingFiles(false);
    } else {
      cancelTailoring();
    }
  };

  const isFormValid = 
    resumeUpload.file && 
    jobDescription.trim().length >= 50;

  const isProcessing = isUploadingFiles || isLoading;

  // Show upload progress if uploading
  if (isUploadingFiles && (resumeUpload.isLoading || workHistoryUpload.isLoading)) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-12">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Uploading Files...</h2>
            
            {resumeUpload.isLoading && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Uploading resume...</p>
                <FileUploadProgress
                  percentage={resumeUpload.uploadProgress}
                  fileName={resumeUpload.file?.name || ''}
                  onCancel={resumeUpload.cancelUpload}
                />
              </div>
            )}
            
            {workHistoryUpload.isLoading && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Uploading work history...</p>
                <FileUploadProgress
                  percentage={workHistoryUpload.uploadProgress}
                  fileName={workHistoryUpload.file?.name || ''}
                  onCancel={workHistoryUpload.cancelUpload}
                />
              </div>
            )}
            
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={handleCancel}>
                Cancel All
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show tailoring progress if processing
  if (isLoading && status) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-12">
          <TailoringProgress
            progress={status.progress}
            message={status.message}
            estimatedTimeRemaining={status.estimatedTimeRemaining}
          />
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error && !isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-12">
          <TailoringError
            error={error}
            onRetry={retryTailoring}
            onCancel={() => window.location.reload()}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Tailor Your Resume</h2>
          <p className="mt-2 text-gray-600">
            Upload your resume and job description to get started
          </p>
        </div>

        <div className="space-y-6">
          <FileUploadZone
            label="Resume"
            required
            file={resumeUpload.file}
            error={resumeUpload.error}
            onFileSelect={resumeUpload.handleFileSelect}
            onClear={resumeUpload.clearFile}
          />

          <FileUploadZone
            label="Work History (Optional)"
            file={workHistoryUpload.file}
            error={workHistoryUpload.error}
            onFileSelect={workHistoryUpload.handleFileSelect}
            onClear={workHistoryUpload.clearFile}
          />

          <JobDescriptionInput
            value={jobDescription}
            onChange={(value) => {
              setJobDescription(value);
              setJobDescriptionError(null);
            }}
            error={jobDescriptionError}
          />

          <div className="pt-4 flex items-center gap-4">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!isFormValid || isProcessing}
              isLoading={isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? 'Processing...' : 'Tailor Resume'}
            </Button>
            
            {(resumeUpload.error || workHistoryUpload.error) && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleSubmit}
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};