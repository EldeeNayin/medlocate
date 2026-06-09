import { useState, useCallback } from 'react';
import { useSearchParams }    from 'react-router-dom';
import { Download, Share2 }   from 'lucide-react';
import { SearchLayout }       from '@/components/layout/SearchLayout';
import { SearchBar }          from '@/components/search/SearchBar';
import { FilterPanel }        from '@/components/search/FilterPanel';
import { HospitalCard }       from '@/components/hospital/HospitalCard';
import { HospitalMap }        from '@/components/hospital/HospitalMap';
import { CsvExportPanel }     from '@/components/share/CsvExportPanel';
import { SharePanel }         from '@/components/share/SharePanel';
import { Spinner }            from '@/components/ui/Spinner';
import { useHospitals }       from '@/hooks/useHospitals';
import { buildShareUrl, parseShareUrl } from '@/lib/shareLink';
import type { SearchFilters } from '@/types';

type ActivePanel = 'export' | 'share' | null;

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters,    setFilters]    = useState<SearchFilters>(() => parseShareUrl(searchParams.toString()));
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const { data: facilities, loading, error } = useHospitals(filters);

  const handleSearch = useCallback((updated: SearchFilters) => {
    setFilters(updated);
    const params = new URLSearchParams();
    if (updated.query)       params.set('q',         updated.query);
    if (updated.city)        params.set('city',       updated.city);
    if (updated.lga)         params.set('lga',        updated.lga);
    if (updated.specialty)   params.set('specialty',  updated.specialty);
    if (updated.ownership)   params.set('ownership',  updated.ownership);
    if (updated.radius)      params.set('radius',     String(updated.radius));
    if (updated.lat != null) params.set('lat',        String(updated.lat));
    if (updated.lng != null) params.set('lng',        String(updated.lng));
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    document.getElementById(`facility-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const handleEmailShare = useCallback(async (email: string) => {
    const url = buildShareUrl(filters);
    const resp = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, shareUrl: url }),
    });
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      throw new Error(body?.error ? `${body.error} ${body?.details ?? ''}` : 'Failed to send email');
    }
  }, [filters]);

  function togglePanel(panel: ActivePanel) {
    setActivePanel((prev) => (prev === panel ? null : panel));
  }

  const countLabel = loading
    ? 'Searching…'
    : `${facilities.length} facilit${facilities.length === 1 ? 'y' : 'ies'} found`;

  return (
    <SearchLayout
      controlZone={
        <>
          <SearchBar initialFilters={filters} onSearch={handleSearch} />

          <div className="flex items-center gap-2 flex-wrap">
            <FilterPanel filters={filters} onChange={handleSearch} />

            <button
              type="button"
              onClick={() => togglePanel('export')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                activePanel === 'export'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>

            <button
              type="button"
              onClick={() => togglePanel('share')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                activePanel === 'share'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>

          {activePanel === 'export' && (
            <div className="rounded-card border border-surface-border bg-surface p-3">
              <CsvExportPanel hospitals={facilities} searchQuery={filters.query} />
            </div>
          )}
          {activePanel === 'share' && (
            <div className="rounded-card border border-surface-border bg-surface p-3">
              <SharePanel filters={filters} onEmailShare={handleEmailShare} />
            </div>
          )}

          <p className="text-xs text-ink-faint">
            {countLabel}
            {filters.lat != null && !loading && (
              <span className="ml-1 text-success">· sorted by proximity</span>
            )}
          </p>
        </>
      }

      listZone={
        loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : error ? (
          <p role="alert" className="text-sm text-danger p-4">{error}</p>
        ) : facilities.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-ink-faint">
            <p className="text-sm">No facilities match your search.</p>
            <p className="text-xs">Try widening your filters or searching a different area.</p>
          </div>
        ) : (
          facilities.map((f) => (
            <div key={f.id} id={`facility-${f.id}`}>
              <HospitalCard
                hospital={f}
                selected={selectedId === f.id}
                onSelect={handleSelect}
              />
            </div>
          ))
        )
      }

      mapZone={
        <HospitalMap
          hospitals={facilities}
          selectedId={selectedId}
          onHospitalClick={handleSelect}
          userLat={filters.lat}
          userLng={filters.lng}
        />
      }
    />
  );
}
