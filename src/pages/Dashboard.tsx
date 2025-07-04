import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileUploadZone } from '@/components/upload/FileUploadZone';
import { FileUploadProgress } from '@/components/upload/FileUploadProgress';
import { JobDescriptionInput } from '@/components/upload/JobDescriptionInput';
import { Button } from '@/components/common/Button';
import { useFileUpload } from '@/hooks/useFileUpload';

export const Dashboard: React.FC = () => {
  const resumeUpload = useFileUpload();
  const workHistoryUpload = useFileUpload();
  const [jobDescription, setJobDescription] = useState('');
  const [jobDescriptionError, setJobDescriptionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate resume
    if (!resumeUpload.file) {
      resumeUpload.handleFileSelect(new File([], '')); // Trigger error
      isValid = false;
    }

    // Validate job description
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

    // Ensure resume upload is complete
    if (resumeUpload.isLoading || !resumeUpload.resumeId) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement API call to submit tailoring request
      console.log('Submitting:', {
        resumeId: resumeUpload.resumeId,
        workHistoryId: workHistoryUpload.resumeId,
        jobDescription,
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Navigate to tailoring screen
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = 
    resumeUpload.file && 
    !resumeUpload.isLoading &&
    resumeUpload.resumeId &&
    jobDescription.trim().length >= 50;

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
          {/* Resume Upload */}
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

          {/* Work History Upload */}
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

          {/* Job Description */}
          <JobDescriptionInput
            value={jobDescription}
            onChange={(value) => {
              setJobDescription(value);
              setJobDescriptionError(null);
            }}
            error={jobDescriptionError}
          />

          {/* Submit Button */}
          <div className="pt-4 flex items-center gap-4">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              isLoading={isSubmitting}
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