import type { TailoringRequest, TailoringResponse, TailoringStatus } from '@/types/tailoring.types';

class MockTailoringService {
  private tailoringJobs = new Map<string, TailoringResponse>();

  async startTailoring(request: TailoringRequest): Promise<TailoringResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const tailoringId = `tailoring-${Date.now()}`;
    const response: TailoringResponse = {
      tailoringId,
      status: 'processing',
      originalResumeId: request.resumeId,
      tailoredVersions: [],
      createdAt: new Date().toISOString(),
    };

    this.tailoringJobs.set(tailoringId, response);

    // Simulate processing completion after 8 seconds
    setTimeout(() => {
      const job = this.tailoringJobs.get(tailoringId);
      if (job) {
        job.status = 'completed';
        job.tailoredResumeId = `tailored-${Date.now()}`;
        job.completedAt = new Date().toISOString();
        job.tailoredVersions = [{
          versionId: `v1-${Date.now()}`,
          versionNumber: 1,
          createdAt: new Date().toISOString(),
          changes: Math.floor(Math.random() * 20) + 5,
        }];
      }
    }, 8000);

    return response;
  }

  async getTailoringStatus(tailoringId: string): Promise<TailoringStatus> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const job = this.tailoringJobs.get(tailoringId);
    if (!job) {
      throw new Error('Tailoring job not found');
    }

    // Simulate progress
    const startTime = new Date(job.createdAt).getTime();
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const totalTime = 8000; // 8 seconds total
    const progress = Math.min(Math.floor((elapsed / totalTime) * 100), 100);

    const messages = [
      'Analyzing job description...',
      'Extracting key requirements...',
      'Matching your experience...',
      'Optimizing content...',
      'Finalizing your tailored resume...',
    ];

    const messageIndex = Math.min(Math.floor(progress / 20), messages.length - 1);
    const estimatedTimeRemaining = Math.max(0, Math.ceil((totalTime - elapsed) / 1000));

    return {
      status: job.status === 'completed' ? 'completed' : 'processing',
      progress,
      message: messages[messageIndex],
      estimatedTimeRemaining: job.status === 'completed' ? 0 : estimatedTimeRemaining,
    };
  }

  async getTailoringResult(tailoringId: string): Promise<TailoringResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const job = this.tailoringJobs.get(tailoringId);
    if (!job) {
      throw new Error('Tailoring job not found');
    }

    return job;
  }

  async cancelTailoring(tailoringId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const job = this.tailoringJobs.get(tailoringId);
    if (job && job.status === 'processing') {
      job.status = 'failed';
      job.error = 'Tailoring cancelled by user';
    }
  }

  async retryTailoring(originalRequest: TailoringRequest): Promise<TailoringResponse> {
    // Simulate a retry with the same request
    return this.startTailoring(originalRequest);
  }
}

export const tailoringService = new MockTailoringService();