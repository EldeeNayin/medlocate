import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HospitalCard } from '@/components/hospital/HospitalCard';
import type { Hospital } from '@/types';

const hospital: Hospital = {
  id: 'h1',
  name: 'Test Hospital',
  address: '1 Test Road',
  city: 'Lagos',
  lga: 'Ikeja',
  state: 'Lagos',
  phone: '08012345678',
  specialties: ['emergency', 'pediatric'],
  ownership: 'public',
  latitude: 6.4541,
  longitude: 3.3947,
  rating_avg: 4.2,
  rating_count: 18,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('HospitalCard', () => {
  it('renders hospital name', () => {
    render(<HospitalCard hospital={hospital} />, { wrapper: Wrapper });
    expect(screen.getByText('Test Hospital')).toBeInTheDocument();
  });

  it('renders ownership badge', () => {
    render(<HospitalCard hospital={hospital} />, { wrapper: Wrapper });
    expect(screen.getByText('public')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const onSelect = vi.fn();
    render(<HospitalCard hospital={hospital} onSelect={onSelect} />, { wrapper: Wrapper });
    await userEvent.click(screen.getByTestId('hospital-card'));
    expect(onSelect).toHaveBeenCalledWith('h1');
  });

  it('renders specialty badges', () => {
    render(<HospitalCard hospital={hospital} />, { wrapper: Wrapper });
    expect(screen.getByText('emergency')).toBeInTheDocument();
    expect(screen.getByText('pediatric')).toBeInTheDocument();
  });
});
