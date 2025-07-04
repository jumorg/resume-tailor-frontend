import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResumeCanvas from '../ResumeCanvas';
import { ResumeSection } from '@/types/resume.types';

describe('ResumeCanvas', () => {
  const mockSections: ResumeSection[] = [
    {
      id: 'header-1',
      type: 'header',
      content: 'John Doe',
      isEditable: false,
    },
    {
      id: 'summary-1',
      type: 'summary',
      content: 'Experienced developer',
      isEditable: true,
    },
  ];

  const mockProps = {
    sections: mockSections,
    selectedSectionId: null,
    isProcessing: false,
    onSectionSelect: vi.fn(),
    onEditSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all sections', () => {
    render(<ResumeCanvas {...mockProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Experienced developer')).toBeInTheDocument();
  });

  it('calls onSectionSelect when clicking editable section', () => {
    render(<ResumeCanvas {...mockProps} />);
    
    const editableSection = screen.getByText('Experienced developer').parentElement;
    fireEvent.click(editableSection!);
    
    expect(mockProps.onSectionSelect).toHaveBeenCalledWith('summary-1');
  });

  it('does not call onSectionSelect for non-editable sections', () => {
    render(<ResumeCanvas {...mockProps} />);
    
    const nonEditableSection = screen.getByText('John Doe').parentElement;
    fireEvent.click(nonEditableSection!);
    
    expect(mockProps.onSectionSelect).not.toHaveBeenCalled();
  });

  it('highlights selected section', () => {
    const props = { ...mockProps, selectedSectionId: 'summary-1' };
    render(<ResumeCanvas {...props} />);
    
    const section = screen.getByText('Experienced developer').parentElement;
    expect(section).toHaveClass('resume-section--selected');
  });
});