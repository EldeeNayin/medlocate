import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RatingWidget } from '@/components/hospital/RatingWidget';

describe('RatingWidget', () => {
  it('renders 5 stars', () => {
    render(<RatingWidget value={3} />);
    const stars = screen.getAllByRole('button');
    expect(stars).toHaveLength(5);
  });

  it('calls onChange when interactive star clicked', async () => {
    const onChange = vi.fn();
    render(<RatingWidget interactive value={0} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Rate 4 stars'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('shows rating count when provided', () => {
    render(<RatingWidget value={4.2} count={18} />);
    expect(screen.getByText('(18)')).toBeInTheDocument();
  });
});
