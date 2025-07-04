export interface TailoringRequest {
  resumeId: string;
  workHistoryId?: string;
  jobDescription: string;
}

export interface TailoringResponse {
  tailoringId: string;
  status: 'processing' | 'completed' | 'failed';
  originalResumeId: string;
  tailoredResumeId?: string;
  tailoredVersions: TailoredVersion[];
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface TailoredVersion {
  versionId: string;
  versionNumber: number;
  createdAt: string;
  changes: number;
}

export interface TailoringStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
}