import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VersionHistory from '../VersionHistory';
import { ResumeVersion } from '@/types/resume.types';

vi.mock('@/utils/date.utils', () => ({
  formatDistanceToNow: vi.fn(() => '5 minutes'),
}));

describe('VersionHistory', () => {
  const mockVersions: ResumeVersion[] = [
    {
      id: 'v1',
      version: 1,
      createdAt: new Date(),
      isActive: false,
      editCount: 0,
      sections: [],
    },
    {
      id: 'v2',
      version: 2,
      createdAt: new Date(),
      isActive: true,
      editCount: 3,
      sections: [],
    },
  ];

  const mockProps = {
    versions: mockVersions,
    currentVersionId: 'v2',
    onVersionSelect: vi.fn(),
    isLoading: false,
  };

  it('renders all versions', () => {
    render(<VersionHistory {...mockProps} />);
    
    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('Version 2')).toBeInTheDocument();
  });

  it('marks current version', () => {
    render(<VersionHistory {...mockProps} />);
    
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('calls onVersionSelect when clicking non-current version', () => {
    render(<VersionHistory {...mockProps} />);
    
    const version1 = screen.getByText('Version 1').parentElement?.parentElement;
    if (version1) {
      fireEvent.click(version1);
      expect(mockProps.onVersionSelect).toHaveBeenCalledWith('v1');
    }
  });

  it('shows loading state', () => {
    const props = { ...mockProps, isLoading: true };
    render(<VersionHistory {...props} />);
    
    expect(screen.getByText('Version History')).toBeInTheDocument();
    expect(screen.queryByText('Version 1')).not.toBeInTheDocument();
  });
});