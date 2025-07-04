import { apiService } from './api.service';
import type { TailoringRequest, TailoringResponse, TailoringStatus } from '@/types/tailoring.types';

class TailoringService {
  async startTailoring(request: TailoringRequest): Promise<TailoringResponse> {
    return apiService.post<TailoringResponse>('/api/tailoring/start', request);
  }

  async getTailoringStatus(tailoringId: string): Promise<TailoringStatus> {
    return apiService.get<TailoringStatus>(`/api/tailoring/${tailoringId}/status`);
  }

  async getTailoringResult(tailoringId: string): Promise<TailoringResponse> {
    return apiService.get<TailoringResponse>(`/api/tailoring/${tailoringId}`);
  }

  async cancelTailoring(tailoringId: string): Promise<void> {
    await apiService.post(`/api/tailoring/${tailoringId}/cancel`);
  }

  async retryTailoring(originalRequest: TailoringRequest): Promise<TailoringResponse> {
    return this.startTailoring(originalRequest);
  }
}

// Export the real service (commented out for now)
// export const tailoringService = new TailoringService();