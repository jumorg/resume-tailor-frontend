import { apiService } from './api.service';
import type { TailoringRequest, TailoringResponse, TailoringStatus } from '@/types/tailoring.types';

class TailoringService {
  async startTailoring(request: TailoringRequest): Promise<TailoringResponse> {
    console.log('Starting tailoring with request:', request);
    
    try {
      const response = await apiService.post<any>('/api/tailoring/start', request);
      console.log('Raw tailoring start response:', response);
      
      // Handle both wrapped and unwrapped responses
      let tailoringData: TailoringResponse;
      
      if (response.success && response.data) {
        // Response is wrapped
        tailoringData = response.data;
      } else if (response.tailoringId) {
        // Response is not wrapped
        tailoringData = response;
      } else {
        console.error('Unexpected response format:', response);
        throw new Error('Invalid response format from server');
      }
      
      console.log('Processed tailoring data:', tailoringData);
      return tailoringData;
    } catch (error) {
      console.error('Tailoring start error:', error);
      throw error;
    }
  }

  async getTailoringStatus(tailoringId: string): Promise<TailoringStatus> {
    const wrapper = await apiService.get<{
      success: boolean;
      data: TailoringStatus;
    }>(`/api/tailoring/${tailoringId}/status`);
    
    if (!wrapper.success) {
      throw new Error('Failed to get tailoring status');
    }
    
    return wrapper.data;
  }

  async getTailoringResult(tailoringId: string): Promise<TailoringResponse> {
    const wrapper = await apiService.get<{
      success: boolean;
      data: TailoringResponse;
    }>(`/api/tailoring/${tailoringId}`);
    
    if (!wrapper.success) {
      throw new Error('Failed to get tailoring result');
    }
    
    return wrapper.data;
  }

  async cancelTailoring(tailoringId: string): Promise<void> {
    // For now, cancellation just stops polling
    // In a future implementation, you could add a cancel endpoint
    console.log('Cancelling tailoring:', tailoringId);
  }

  async downloadTailoredResume(downloadUrl: string): Promise<void> {
    // Trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'tailored-resume.txt'; // Will be updated when we add PDF support
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Export the real service
export const tailoringService = new TailoringService();