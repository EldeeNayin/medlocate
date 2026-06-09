import { describe, it, expect } from 'vitest';
import { buildShareUrl, parseShareUrl } from '@/lib/shareLink';
import type { SearchFilters } from '@/types';

describe('buildShareUrl', () => {
  it('encodes filters as URL params', () => {
    const url = buildShareUrl({ city: 'Lagos', specialty: 'maternity', radius: 10 }, 'https://medlocate.ng');
    expect(url).toContain('city=Lagos');
    expect(url).toContain('specialty=maternity');
    expect(url).toContain('radius=10');
  });

  it('omits undefined filters', () => {
    const url = buildShareUrl({ city: 'Abuja' }, 'https://medlocate.ng');
    expect(url).not.toContain('specialty');
    expect(url).not.toContain('radius');
  });
});

describe('parseShareUrl', () => {
  it('round-trips filters through URL', () => {
    const original: SearchFilters = { city: 'Lagos', specialty: 'dental', radius: 5 };
    const url = buildShareUrl(original, '');
    const parsed = parseShareUrl(url.split('?')[1]);
    expect(parsed.city).toBe('Lagos');
    expect(parsed.specialty).toBe('dental');
    expect(parsed.radius).toBe(5);
  });
});
