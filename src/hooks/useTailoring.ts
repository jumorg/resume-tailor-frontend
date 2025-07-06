import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Import the real service instead of mock
import { tailoringService } from '@/services/tailoring.service';
// import { tailoringService } from '@/services/tailoring.service.mock';
import type { TailoringRequest, TailoringResponse, TailoringStatus } from '@/types/tailoring.types';

interface UseTailoringOptions {
  onSuccess?: (response: TailoringResponse) => void;
  onError?: (error: Error) => void;
}

export const useTailoring = (options: UseTailoringOptions = {}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tailoringId, setTailoringId] = useState<string | null>(null);
  const [status, setStatus] = useState<TailoringStatus | null>(null);
  const [result, setResult] = useState<TailoringResponse | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const requestRef = useRef<TailoringRequest | null>(null);

  const startTailoring = useCallback(async (request: TailoringRequest) => {
    setIsLoading(true);
    setError(null);
    requestRef.current = request;

    try {
      const response = await tailoringService.startTailoring(request);
      setTailoringId(response.tailoringId);
      
      // Start polling for status
      let pollCount = 0;
      const maxPolls = 60; // 60 seconds max polling
      
      pollingIntervalRef.current = setInterval(async () => {
        try {
          pollCount++;
          
          console.log(`Polling status attempt ${pollCount} for ${response.tailoringId}`);
          
          const status = await tailoringService.getTailoringStatus(response.tailoringId);
          setStatus(status);

          if (status.status === 'completed' || status.status === 'failed' || pollCount >= maxPolls) {
            clearInterval(pollingIntervalRef.current!);
            pollingIntervalRef.current = null;
            
            if (status.status === 'completed') {
              const result = await tailoringService.getTailoringResult(response.tailoringId);
              setResult(result);
              setIsLoading(false);
              options.onSuccess?.(result);
              
              // Navigate to tailoring page with result
              navigate(`/tailoring/${response.tailoringId}`);
            } else if (status.status === 'failed') {
              throw new Error(status.message || 'Tailoring failed');
            } else {
              throw new Error('Tailoring timed out');
            }
          }
        } catch (err) {
          clearInterval(pollingIntervalRef.current!);
          pollingIntervalRef.current = null;
          setError(err instanceof Error ? err.message : 'Failed to check tailoring status');
          setIsLoading(false);
          options.onError?.(err instanceof Error ? err : new Error('Unknown error'));
        }
      }, 2000); // Poll every 2 seconds instead of 1

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start tailoring');
      setIsLoading(false);
      options.onError?.(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [navigate, options]);

  const cancelTailoring = useCallback(async () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    if (tailoringId) {
      try {
        await tailoringService.cancelTailoring(tailoringId);
      } catch (err) {
        console.error('Failed to cancel tailoring:', err);
      }
    }

    setIsLoading(false);
    setTailoringId(null);
    setStatus(null);
    setError(null);
  }, [tailoringId]);

  const retryTailoring = useCallback(async () => {
    if (requestRef.current) {
      await startTailoring(requestRef.current);
    }
  }, [startTailoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    startTailoring,
    cancelTailoring,
    retryTailoring,
    isLoading,
    error,
    status,
    result,
  };
};