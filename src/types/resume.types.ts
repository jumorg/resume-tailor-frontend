export interface ResumeSection {
  id: string;
  type: 'header' | 'experience' | 'education' | 'skills' | 'summary';
  content: string;
  isEditable: boolean;
}

export interface ResumeVersion {
  id: string;
  version: number;
  sections: ResumeSection[];
  createdAt: Date;
  isActive: boolean;
  editCount: number;
}

export interface EditRequest {
  sectionId: string;
  originalText: string;
  newText: string;
  prompt?: string;
}

export interface EditHistoryItem {
  id: string;
  sectionId: string;
  oldText: string;
  newText: string;
  timestamp: Date;
}