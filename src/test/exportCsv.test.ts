import { describe, it, expect } from 'vitest';
import { buildFilename } from '@/lib/exportCsv';

describe('buildFilename', () => {
  it('slugifies the search query', () => {
    const name = buildFilename('Lagos Maternity', new Date('2025-06-01'));
    expect(name).toBe('hospitals-lagos-maternity-2025-06-01.csv');
  });

  it('uses "results" when query is empty', () => {
    const name = buildFilename('', new Date('2025-06-01'));
    expect(name).toBe('hospitals-results-2025-06-01.csv');
  });

  it('strips special characters from query', () => {
    const name = buildFilename('Lagos & Abuja!', new Date('2025-06-01'));
    expect(name).toBe('hospitals-lagos--abuja-2025-06-01.csv');
  });
});
