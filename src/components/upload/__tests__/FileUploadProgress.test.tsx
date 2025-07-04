import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUploadProgress } from '../FileUploadProgress.tsx';

describe('FileUploadProgress', () => {
  it('renders file name and progress', () => {
    render(
      <FileUploadProgress 
        fileName="test-resume.pdf" 
        percentage={50} 
      />
    );
    
    expect(screen.getByText('test-resume.pdf')).toBeInTheDocument();
    expect(screen.getByText('Uploading... 50%')).toBeInTheDocument();
  });

  it('renders progress bar with correct width', () => {
    render(
      <FileUploadProgress 
        fileName="test-resume.pdf" 
        percentage={75} 
      />
    );
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '75%' });
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
  });

  it('shows cancel button when onCancel is provided and upload is not complete', () => {
    const mockOnCancel = vi.fn();
    render(
      <FileUploadProgress 
        fileName="test-resume.pdf" 
        percentage={50}
        onCancel={mockOnCancel}
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeInTheDocument();
    
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('hides cancel button when upload is complete', () => {
    const mockOnCancel = vi.fn();
    render(
      <FileUploadProgress 
        fileName="test-resume.pdf" 
        percentage={100}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });
});