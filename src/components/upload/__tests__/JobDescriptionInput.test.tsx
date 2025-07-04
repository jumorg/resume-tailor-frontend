import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JobDescriptionInput } from '../JobDescriptionInput';

describe('JobDescriptionInput', () => {
  const mockOnChange = vi.fn();

  it('renders with label and required indicator', () => {
    render(<JobDescriptionInput value="" onChange={mockOnChange} />);
    
    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows character count', () => {
    render(<JobDescriptionInput value="" onChange={mockOnChange} />);
    expect(screen.getByText('10,000 characters remaining')).toBeInTheDocument();
  });

  it('updates character count as user types', () => {
    const { rerender } = render(
      <JobDescriptionInput value="" onChange={mockOnChange} />
    );
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test content' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('Test content');
    
    rerender(
      <JobDescriptionInput value="Test content" onChange={mockOnChange} />
    );
    
    expect(screen.getByText('9,988 characters remaining')).toBeInTheDocument();
  });

  it('shows warning when approaching limit', () => {
    const longText = 'a'.repeat(9950);
    render(<JobDescriptionInput value={longText} onChange={mockOnChange} />);
    
    const remainingText = screen.getByText(/characters remaining/);
    expect(remainingText).toHaveClass('text-red-500');
  });

  it('displays error message', () => {
    render(
      <JobDescriptionInput 
        value="" 
        onChange={mockOnChange} 
        error="Job description is required" 
      />
    );
    
    expect(screen.getByRole('alert')).toHaveTextContent('Job description is required');
  });
});