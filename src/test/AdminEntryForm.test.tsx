import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminEntryForm } from '@/components/admin/AdminEntryForm';

describe('AdminEntryForm', () => {
  it('renders all required fields', () => {
    render(<AdminEntryForm onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/hospital name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid phone', async () => {
    render(<AdminEntryForm onSubmit={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/phone/i), '123');
    await userEvent.click(screen.getByText(/create hospital/i));
    expect(await screen.findByText(/valid nigerian phone/i)).toBeInTheDocument();
  });

  it('calls onCancel when cancel is clicked', async () => {
    const onCancel = vi.fn();
    render(<AdminEntryForm onSubmit={vi.fn()} onCancel={onCancel} />);
    await userEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
