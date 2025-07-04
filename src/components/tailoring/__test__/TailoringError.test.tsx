import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TailoringError } from '../TailoringError';

describe('TailoringError', () => {
  const mockOnRetry = vi.fn();
  const mockOnCancel = vi.fn();

  it('renders error message', () => {
    render(
      <TailoringError
        error="Failed to connect to the server"
        onRetry={mockOnRetry}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Tailoring Failed')).toBeInTheDocument();
    expect(screen.getByText('Failed to connect to the server')).toBeInTheDocument();
  });

  it('calls onRetry when Try Again is clicked', () => {
    render(
      <TailoringError
        error="Network error"
        onRetry={mockOnRetry}
        onCancel={mockOnCancel}
      />
    );

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('calls onCancel when Cancel is clicked', () => {
    render(
      <TailoringError
        error="Network error"
        onRetry={mockOnRetry}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });
});