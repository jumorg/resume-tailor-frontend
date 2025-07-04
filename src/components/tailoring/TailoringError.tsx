import React from 'react';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';

interface TailoringErrorProps {
  error: string;
  onRetry: () => void;
  onCancel: () => void;
}

export const TailoringError: React.FC<TailoringErrorProps> = ({
  error,
  onRetry,
  onCancel,
}) => {
  return (
    <div className="space-y-4">
      <Alert type="error" title="Tailoring Failed">
        {error}
      </Alert>

      <div className="flex gap-3">
        <Button onClick={onRetry} variant="primary">
          Try Again
        </Button>
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  );
};