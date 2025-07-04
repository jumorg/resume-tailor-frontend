import { ResumeService } from './resume.service';
import { ResumeVersion, EditRequest } from '@/types/resume.types';

const mockResumeContent: ResumeVersion = {
  id: 'resume-v1',
  version: 1,
  createdAt: new Date(),
  isActive: true,
  editCount: 0,
  sections: [
    {
      id: 'header-1',
      type: 'header',
      content: 'John Doe\nSoftware Engineer\njohn.doe@email.com | (555) 123-4567',
      isEditable: false,
    },
    {
      id: 'summary-1',
      type: 'summary',
      content: 'Experienced software engineer with 5+ years developing scalable web applications. Proficient in React, Node.js, and cloud technologies.',
      isEditable: true,
    },
    {
      id: 'exp-1',
      type: 'experience',
      content: '• Led development of microservices architecture serving 1M+ users\n• Implemented CI/CD pipeline reducing deployment time by 60%\n• Mentored junior developers and conducted code reviews',
      isEditable: true,
    },
    {
      id: 'skills-1',
      type: 'skills',
      content: 'JavaScript, TypeScript, React, Node.js, AWS, Docker, PostgreSQL, Redis',
      isEditable: true,
    },
  ],
};

export class MockResumeService implements ResumeService {
  private versions: Map<string, ResumeVersion[]> = new Map();
  private currentVersion: Map<string, ResumeVersion> = new Map();

  constructor() {
    // Initialize with mock data
    this.versions.set('test-resume-id', [mockResumeContent]);
    this.currentVersion.set('test-resume-id', mockResumeContent);
  }

  async getResumeContent(resumeId: string): Promise<ResumeVersion> {
    await this.simulateDelay(300);
    return this.currentVersion.get(resumeId) || mockResumeContent;
  }

  async getVersionHistory(resumeId: string): Promise<ResumeVersion[]> {
    await this.simulateDelay(200);
    return this.versions.get(resumeId) || [mockResumeContent];
  }

  async saveEdit(resumeId: string, edit: EditRequest): Promise<ResumeVersion> {
    await this.simulateDelay(500);
    
    const current = this.currentVersion.get(resumeId) || mockResumeContent;
    const newVersion: ResumeVersion = {
      ...current,
      id: `resume-v${current.version + 1}`,
      version: current.version + 1,
      createdAt: new Date(),
      editCount: current.editCount + 1,
      sections: current.sections.map(section => 
        section.id === edit.sectionId 
          ? { ...section, content: edit.newText }
          : section
      ),
    };

    // Update version history
    const history = this.versions.get(resumeId) || [];
    this.versions.set(resumeId, [...history, newVersion].slice(-5)); // Keep last 5 versions
    this.currentVersion.set(resumeId, newVersion);

    return newVersion;
  }

  async revertToVersion(resumeId: string, versionId: string): Promise<ResumeVersion> {
    await this.simulateDelay(300);
    
    const history = this.versions.get(resumeId) || [];
    const version = history.find(v => v.id === versionId);
    
    if (version) {
      this.currentVersion.set(resumeId, version);
      return version;
    }
    
    throw new Error('Version not found');
  }

  async enhanceText(text: string, prompt: string): Promise<string> {
    await this.simulateDelay(1500);
    
    // Simulate AI enhancement
    const enhancements: Record<string, string> = {
      'more impactful': text.replace(/Led/g, 'Spearheaded').replace(/Implemented/g, 'Architected'),
      'quantify': text.replace(/users/g, '2M+ users').replace(/reducing/g, 'reducing by 75%'),
      'action verbs': text.replace(/Proficient/g, 'Expert').replace(/Experienced/g, 'Accomplished'),
    };

    // Default enhancement
    return enhancements[prompt.toLowerCase()] || 
           text.replace(/\./g, ', driving significant business impact.');
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockResumeService = new MockResumeService();