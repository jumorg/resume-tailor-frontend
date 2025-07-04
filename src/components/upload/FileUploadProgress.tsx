import React from 'react';

interface FileUploadProgressProps {
  percentage: number;
  fileName: string;
  onCancel?: () => void;
}

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  percentage,
  fileName,
  onCancel,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
          <p className="text-sm text-gray-500">Uploading... {percentage}%</p>
        </div>
        {onCancel && percentage < 100 && (
          <button
            onClick={onCancel}
            className="ml-4 text-sm text-red-600 hover:text-red-500"
          >
            Cancel
          </button>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};