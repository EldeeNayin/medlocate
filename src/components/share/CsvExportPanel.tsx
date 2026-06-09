import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { exportHospitalsCsv, buildFilename } from '@/lib/exportCsv';
import type { Hospital, ExportColumn } from '@/types';

const ALL_COLUMNS: { key: ExportColumn; label: string }[] = [
  { key: 'name',       label: 'Name' },
  { key: 'address',    label: 'Address' },
  { key: 'phone',      label: 'Phone' },
  { key: 'email',      label: 'Email' },
  { key: 'specialties',label: 'Specialties' },
  { key: 'rating',     label: 'Rating' },
];

interface CsvExportPanelProps {
  hospitals: Hospital[];
  searchQuery?: string;
}

export function CsvExportPanel({ hospitals, searchQuery = '' }: CsvExportPanelProps) {
  const [selected, setSelected] = useState<Set<ExportColumn>>(
    new Set(['name', 'address', 'phone', 'specialties', 'rating']),
  );

  function toggle(col: ExportColumn) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(col) ? next.delete(col) : next.add(col);
      return next;
    });
  }

  function handleExport() {
    exportHospitalsCsv(hospitals, {
      columns:  [...selected],
      filename: buildFilename(searchQuery),
    });
  }

  return (
    <div className="space-y-3" data-testid="csv-export-panel">
      <h3 className="text-sm font-semibold text-ink">Export CSV</h3>

      <fieldset>
        <legend className="text-xs text-ink-muted mb-2">Select columns</legend>
        <div className="flex flex-wrap gap-2">
          {ALL_COLUMNS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selected.has(key)}
                onChange={() => toggle(key)}
                className="rounded border-surface-border text-brand-600 focus:ring-brand-500"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleExport}
        disabled={selected.size === 0 || hospitals.length === 0}
        className="w-full"
      >
        <Download className="h-4 w-4" />
        Download {hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''}
      </Button>
    </div>
  );
}
