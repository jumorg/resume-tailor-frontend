import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUploadZone } from '../FileUploadZone';

describe('FileUploadZone', () => {
  const mockOnFileSelect = vi.fn();
  const mockOnClear = vi.fn();

  const defaultProps = {
    label: 'Test Upload',
    onFileSelect: mockOnFileSelect,
    file: null,
    error: null,
    onClear: mockOnClear,
  };

  it('renders upload zone with label', () => {
    render(<FileUploadZone {...defaultProps} />);
    expect(screen.getByText('Test Upload')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<FileUploadZone {...defaultProps} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('handles file selection via click', () => {
    render(<FileUploadZone {...defaultProps} />);
    
    const input = screen.getByLabelText('Test Upload') as HTMLInputElement;
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    fireEvent.change(input, { target: { files: [file] } });
    expect(mockOnFileSelect).toHaveBeenCalledWith(file);
  });

  it('handles drag and drop', () => {
    render(<FileUploadZone {...defaultProps} />);
    
    const dropZone = screen.getByText(/click to upload/i).parentElement!;
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });
    
    expect(mockOnFileSelect).toHaveBeenCalledWith(file);
  });

  it('displays file info when file is selected', () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    render(<FileUploadZone {...defaultProps} file={file} />);
    
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<FileUploadZone {...defaultProps} error="File too large" />);
    expect(screen.getByRole('alert')).toHaveTextContent('File too large');
  });
});