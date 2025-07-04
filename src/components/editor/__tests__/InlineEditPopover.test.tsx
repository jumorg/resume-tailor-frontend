import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InlineEditPopover from '../InlineEditPopover';

describe('InlineEditPopover', () => {
  const mockProps = {
    position: { top: 100, left: 200 },
    selectedText: 'Test text',
    isProcessing: false,
    onSubmit: vi.fn(),
    onClose: vi.fn(),
  };

  it('renders with selected text', () => {
    render(<InlineEditPopover {...mockProps} />);
    
    expect(screen.getByText('"Test text"')).toBeInTheDocument();
  });

  it('focuses input on mount', () => {
    render(<InlineEditPopover {...mockProps} />);
    
    const input = screen.getByPlaceholderText('How should I improve this text?');
    expect(document.activeElement).toBe(input);
  });

  it('calls onSubmit with prompt', async () => {
    render(<InlineEditPopover {...mockProps} />);
    
    const input = screen.getByPlaceholderText('How should I improve this text?');
    fireEvent.change(input, { target: { value: 'Make it better' } });
    fireEvent.submit(input);
    
    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalledWith('Make it better');
    });
  });

  it('calls onSubmit with quick action', async () => {
    render(<InlineEditPopover {...mockProps} />);
    
    const quickAction = screen.getByText('Make more impactful');
    fireEvent.click(quickAction);
    
    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalledWith('more impactful');
    });
  });

  it('disables submit when processing', () => {
    const props = { ...mockProps, isProcessing: true };
    render(<InlineEditPopover {...props} />);
    
    const submitButton = screen.getByText('Processing...');
    expect(submitButton).toBeDisabled();
  });
});