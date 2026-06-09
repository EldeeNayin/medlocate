import { useState } from 'react';
import { ListFilter, X, ChevronDown } from 'lucide-react';
import type { SearchFilters, Specialty, OwnershipType } from '@/types';

const SPECIALTIES: Specialty[] = [
  'maternity', 'emergency', 'dental', 'pediatric',
  'cardiology', 'orthopedics', 'oncology', 'general',
];

const RADIUS_KM = [5, 10, 20, 50];

interface FilterPanelProps {
  filters:  SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  const activeCount = [filters.specialty, filters.ownership, filters.radius].filter(Boolean).length;

  function clearFilters() {
    onChange({ query: filters.query, lat: filters.lat, lng: filters.lng });
  }

  return (
    <div className="relative" data-testid="filter-panel">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="filter-dropdown"
        className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm font-medium text-ink-muted shadow-card hover:border-brand-300 hover:text-ink transition-colors"
      >
        <ListFilter className="h-4 w-4" />
        Refine
        {activeCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white text-[10px] font-bold">
            {activeCount}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          id="filter-dropdown"
          role="region"
          aria-label="Search filters"
          className="absolute left-0 top-11 z-20 w-72 rounded-card border border-surface-border bg-surface shadow-card-hover p-4 space-y-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Refine results</p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded p-0.5 text-ink-faint hover:text-ink hover:bg-surface-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Specialty */}
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Specialty / service
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChange({ ...filters, specialty: filters.specialty === s ? undefined : s })}
                  className={`rounded-pill px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                    filters.specialty === s
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-muted text-ink-muted hover:bg-surface-border'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Ownership */}
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Facility type
            </legend>
            <div className="flex gap-2">
              {(['public', 'private'] as OwnershipType[]).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => onChange({ ...filters, ownership: filters.ownership === o ? undefined : o })}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium capitalize transition-colors ${
                    filters.ownership === o
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-muted text-ink-muted hover:bg-surface-border'
                  }`}
                >
                  {o === 'public' ? 'Government' : 'Private'}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Distance */}
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Distance (km)
            </legend>
            <div className="flex gap-2">
              {RADIUS_KM.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onChange({ ...filters, radius: filters.radius === r ? undefined : r })}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                    filters.radius === r
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-muted text-ink-muted hover:bg-surface-border'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </fieldset>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="w-full text-xs text-ink-faint hover:text-danger transition-colors py-1"
            >
              × Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
