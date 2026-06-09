import { describe, it, expect } from 'vitest';
import { hospitalSchema } from '@/lib/validation';

const valid = {
  name: 'Lagos Island General Hospital',
  address: '1 Hospital Road, Lagos Island',
  city: 'Lagos',
  lga: 'Lagos Island',
  state: 'Lagos',
  phone: '08012345678',
  specialties: ['general'],
  ownership: 'public' as const,
  latitude: 6.4541,
  longitude: 3.3947,
};

describe('hospitalSchema', () => {
  it('accepts a valid hospital', () => {
    expect(hospitalSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid Nigerian phone', () => {
    const result = hospitalSchema.safeParse({ ...valid, phone: '123' });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const result = hospitalSchema.safeParse({ ...valid, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty specialties', () => {
    const result = hospitalSchema.safeParse({ ...valid, specialties: [] });
    expect(result.success).toBe(false);
  });

  it('rejects out-of-bounds coordinates', () => {
    const result = hospitalSchema.safeParse({ ...valid, latitude: 999 });
    expect(result.success).toBe(false);
  });
});
