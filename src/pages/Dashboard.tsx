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

    if (resumeUpload.isLoading || !resumeUpload.resumeId) {
      return;
    }

    await startTailoring({
      resumeId: resumeUpload.resumeId,
      workHistoryId: workHistoryUpload.resumeId || undefined,
      jobDescription,
    });
  };

  const handleCancel = () => {
    cancelTailoring();
  };

  const isFormValid = 
    resumeUpload.file && 
    !resumeUpload.isLoading &&
    resumeUpload.resumeId &&
    jobDescription.trim().length >= 50;

  // Show tailoring progress if processing
  if (isLoading && status) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-12">
          <TailoringProgress
            status={status.status}
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
          {resumeUpload.isLoading ? (
            <FileUploadProgress
              percentage={resumeUpload.uploadProgress}
              fileName={resumeUpload.file?.name || ''}
              onCancel={resumeUpload.cancelUpload}
            />
          ) : (
            <FileUploadZone
              label="Resume"
              required
              file={resumeUpload.file}
              error={resumeUpload.error}
              onFileSelect={resumeUpload.handleFileSelect}
              onClear={resumeUpload.clearFile}
            />
          )}

          {workHistoryUpload.isLoading ? (
            <FileUploadProgress
              percentage={workHistoryUpload.uploadProgress}
              fileName={workHistoryUpload.file?.name || ''}
              onCancel={workHistoryUpload.cancelUpload}
            />
          ) : (
            <FileUploadZone
              label="Work History (Optional)"
              file={workHistoryUpload.file}
              error={workHistoryUpload.error}
              onFileSelect={workHistoryUpload.handleFileSelect}
              onClear={workHistoryUpload.clearFile}
            />
          )}

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
              disabled={!isFormValid || isLoading}
              isLoading={isLoading}
              className="w-full sm:w-auto"
            >
              Tailor Resume
            </Button>
            
            {resumeUpload.error && resumeUpload.file && (
              <Button
                variant="outline"
                size="lg"
                onClick={resumeUpload.retryUpload}
              >
                Retry Upload
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};