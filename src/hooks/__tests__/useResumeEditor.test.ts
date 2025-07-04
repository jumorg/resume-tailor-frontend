import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useResumeEditor } from '../useResumeEditor';
import React from 'react';

// Mock the resume service
vi.mock('@/services/resume.service.mock', () => ({
  mockResumeService: {
    getResumeContent: vi.fn(),
    getVersionHistory: vi.fn(),
    saveEdit: vi.fn(),
    enhanceText: vi.fn(),
  },
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ resumeId: 'test-resume-id' }),
    useNavigate: () => vi.fn(),
  };
});

// Import the mocked service after mocking
import { mockResumeService } from '@/services/resume.service.mock';

describe('useResumeEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    vi.mocked(mockResumeService.getResumeContent).mockResolvedValue({
      id: 'resume-v1',
      version: 1,
      createdAt: new Date(),
      isActive: true,
      editCount: 0,
      sections: [
        { id: 'header-1', type: 'header', content: 'John Doe', isEditable: false },
        { id: 'summary-1', type: 'summary', content: 'Experienced developer', isEditable: true },
        { id: 'exp-1', type: 'experience', content: 'Work experience', isEditable: true },
        { id: 'skills-1', type: 'skills', content: 'Skills', isEditable: true },
      ],
    });
    
    vi.mocked(mockResumeService.getVersionHistory).mockResolvedValue([
      {
        id: 'resume-v1',
        version: 1,
        createdAt: new Date(),
        isActive: true,
        editCount: 0,
        sections: [],
      },
    ]);
    
    vi.mocked(mockResumeService.saveEdit).mockResolvedValue({
      id: 'resume-v2',
      version: 2,
      createdAt: new Date(),
      isActive: true,
      editCount: 1,
      sections: [
        { id: 'header-1', type: 'header', content: 'John Doe', isEditable: false },
        { id: 'summary-1', type: 'summary', content: 'Enhanced text', isEditable: true },
        { id: 'exp-1', type: 'experience', content: 'Work experience', isEditable: true },
        { id: 'skills-1', type: 'skills', content: 'Skills', isEditable: true },
      ],
    });
    
    vi.mocked(mockResumeService.enhanceText).mockResolvedValue('Enhanced text');
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(BrowserRouter, null, children);
  };

  it('loads resume content on mount', async () => {
    const { result } = renderHook(() => useResumeEditor(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.resumeContent).toBeTruthy();
    expect(result.current.resumeContent?.sections).toHaveLength(4);
  });

  it('loads version history', async () => {
    const { result } = renderHook(() => useResumeEditor(), { wrapper });

    await waitFor(() => {
      expect(result.current.versions).toHaveLength(1);
    });

    expect(result.current.versions[0].version).toBe(1);
  });

  it('handles section selection', async () => {
    const { result } = renderHook(() => useResumeEditor(), { wrapper });

    await waitFor(() => {
      expect(result.current.resumeContent).toBeTruthy();
    });

    act(() => {
      result.current.handleSectionSelect('summary-1');
    });

    expect(result.current.selectedSectionId).toBe('summary-1');
  });

  it('increments edit count on edit', async () => {
    const { result } = renderHook(() => useResumeEditor(), { wrapper });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.resumeContent).toBeTruthy();
    });

    expect(result.current.editCount).toBe(0);
    
    // Perform the edit
    await act(async () => {
      result.current.handleSectionSelect('summary-1');
    });
    
    await act(async () => {
      await result.current.handleEditSubmit('New text', 'Make it better');
    });

    // Wait for the edit count to update
    await waitFor(() => {
      expect(result.current.editCount).toBe(1);
    });
    
    // Verify the service was called correctly
    expect(mockResumeService.enhanceText).toHaveBeenCalledWith('New text', 'Make it better');
    expect(mockResumeService.saveEdit).toHaveBeenCalled();
  });
});