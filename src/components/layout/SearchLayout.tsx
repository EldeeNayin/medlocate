import { useState, type ReactNode } from 'react';
import { Map, List } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SearchLayoutProps {
  mapZone:     ReactNode;
  listZone:    ReactNode;
  controlZone: ReactNode;
}

/**
 * Desktop: [controls + list (40%)] | [map (60%)]
 * Mobile: toggled between list and map views
 */
export function SearchLayout({ mapZone, listZone, controlZone }: SearchLayoutProps) {
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ── Left pane (controls + list) ── */}
      <div
        className={`
          flex flex-col w-full lg:w-[420px] shrink-0
          border-r border-surface-border bg-surface overflow-hidden
          ${mobileView === 'map' ? 'hidden lg:flex' : 'flex'}
        `}
      >
        {/* Controls */}
        <div className="shrink-0 p-3 border-b border-surface-border space-y-2">
          {controlZone}
        </div>

        {/* Hospital list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {listZone}
        </div>
      </div>

      {/* ── Right pane (map) ── */}
      <div
        className={`
          flex-1 relative
          ${mobileView === 'list' ? 'hidden lg:block' : 'block'}
        `}
      >
        {mapZone}
      </div>

      {/* ── Mobile toggle ── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1 rounded-pill border border-surface-border bg-surface shadow-card-hover p-1 lg:hidden">
        <Button
          size="sm"
          variant={mobileView === 'list' ? 'primary' : 'ghost'}
          onClick={() => setMobileView('list')}
        >
          <List className="h-4 w-4" />
          List
        </Button>
        <Button
          size="sm"
          variant={mobileView === 'map' ? 'primary' : 'ghost'}
          onClick={() => setMobileView('map')}
        >
          <Map className="h-4 w-4" />
          Map
        </Button>
      </div>
    </div>
  );
}
