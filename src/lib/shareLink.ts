import type { SearchFilters } from '@/types';

/**
 * Builds a human-readable shareable URL from current filters.
 * e.g. /search?city=Lagos&specialty=maternity&radius=10
 */
export function buildShareUrl(filters: SearchFilters, base = window.location.origin): string {
  const params = new URLSearchParams();
  if (filters.query)     params.set('q',         filters.query);
  if (filters.city)      params.set('city',       filters.city);
  if (filters.lga)       params.set('lga',        filters.lga);
  if (filters.specialty) params.set('specialty',  filters.specialty);
  if (filters.ownership) params.set('ownership',  filters.ownership);
  if (filters.radius)    params.set('radius',     String(filters.radius));
  if (filters.lat)       params.set('lat',        String(filters.lat));
  if (filters.lng)       params.set('lng',        String(filters.lng));
  return `${base}/search?${params.toString()}`;
}

/**
 * Parses URL search params back into SearchFilters.
 */
export function parseShareUrl(search: string): SearchFilters {
  const params = new URLSearchParams(search);
  return {
    query:     params.get('q')         ?? undefined,
    city:      params.get('city')      ?? undefined,
    lga:       params.get('lga')       ?? undefined,
    specialty: (params.get('specialty') as SearchFilters['specialty']) ?? undefined,
    ownership: (params.get('ownership') as SearchFilters['ownership']) ?? undefined,
    radius:    params.has('radius') ? Number(params.get('radius')) : undefined,
    lat:       params.has('lat')    ? Number(params.get('lat'))    : undefined,
    lng:       params.has('lng')    ? Number(params.get('lng'))    : undefined,
  };
}

/**
 * Copies text to clipboard; resolves true on success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
