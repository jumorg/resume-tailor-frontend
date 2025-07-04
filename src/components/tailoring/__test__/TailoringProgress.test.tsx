import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TailoringProgress } from '../TailoringProgress';

describe('TailoringProgress', () => {
  it('renders progress information', () => {
    render(
      <TailoringProgress
        progress={50}
        message="Analyzing job description..."
        estimatedTimeRemaining={10}
      />
    );

    expect(screen.getByText('Tailoring Your Resume')).toBeInTheDocument();
    expect(screen.getByText('Analyzing job description...')).toBeInTheDocument();
    expect(screen.getByText('Progress: 50%')).toBeInTheDocument();
    expect(screen.getByText('Estimated time: 10 seconds')).toBeInTheDocument();
  });

  it('formats time correctly for minutes', () => {
    render(
      <TailoringProgress
        progress={25}
        message="Processing..."
        estimatedTimeRemaining={120}
      />
    );

    expect(screen.getByText('Estimated time: 2 minutes')).toBeInTheDocument();
  });

  it('renders progress bar with correct width', () => {
    render(
      <TailoringProgress
        progress={75}
        message="Almost done..."
      />
    );

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '75%' });
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
  });
});