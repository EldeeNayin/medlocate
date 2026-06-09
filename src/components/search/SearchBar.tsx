import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Search, LocateFixed, Loader2 } from 'lucide-react';
import { Input }          from '@/components/ui/Input';
import { Button }         from '@/components/ui/Button';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { SearchFilters } from '@/types';

interface SearchBarProps {
  initialFilters?: SearchFilters;
  onSearch: (filters: SearchFilters) => void;
}

export function SearchBar({ initialFilters = {}, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(initialFilters.query ?? '');
  const { request: requestLocation, loading: locating, lat, lng, error: locError } = useGeolocation();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fire search automatically once coords arrive
  const lastLat = useRef<number | null>(null);
  useEffect(() => {
    if (lat != null && lng != null && lat !== lastLat.current) {
      lastLat.current = lat;
      onSearch({ ...initialFilters, query: query.trim() || undefined, lat, lng });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch({
      ...initialFilters,
      query: query.trim() || undefined,
      lat:   lat  ?? undefined,
      lng:   lng  ?? undefined,
    });
  }

  return (
    <form
      role="search"
      aria-label="Search facilities"
      onSubmit={handleSubmit}
      className="flex gap-2 w-full"
      data-testid="search-bar"
    >
      <div className="flex-1">
        <Input
          ref={inputRef}
          type="search"
          name="q"
          placeholder="Facility name, city, state, or LGA…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leading={<Search className="h-4 w-4" />}
          aria-label="Search query"
          autoComplete="off"
        />
        {locError && (
          <p role="alert" className="mt-1 text-xs text-danger">{locError}</p>
        )}
        {lat != null && !locError && (
          <p className="mt-1 text-xs text-success">✓ Location detected — showing nearest results first</p>
        )}
      </div>

      <Button
        type="button"
        variant={lat != null ? 'primary' : 'secondary'}
        size="md"
        onClick={requestLocation}
        aria-label="Use my location"
        title="Use my location"
        loading={locating}
      >
        {locating
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <LocateFixed className="h-4 w-4" />
        }
        <span className="hidden sm:inline">
          {lat != null ? 'Nearby' : 'Use location'}
        </span>
      </Button>

      <Button type="submit" variant="primary" size="md">
        Search
      </Button>
    </form>
  );
}
