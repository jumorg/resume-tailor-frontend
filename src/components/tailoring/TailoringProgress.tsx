import React from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface TailoringProgressProps {
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
}

export const TailoringProgress: React.FC<TailoringProgressProps> = ({
  progress,
  message,
  estimatedTimeRemaining,
}) => {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <LoadingSpinner size="md" className="mr-3" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">Tailoring Your Resume</h3>
          <p className="text-sm text-gray-500 mt-1">{message}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress: {progress}%</span>
          {estimatedTimeRemaining !== undefined && (
            <span className="text-gray-600">
              Estimated time: {formatTime(estimatedTimeRemaining)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>This typically takes 10-15 seconds. Please don't close this window.</p>
      </div>
    </div>
  );
};