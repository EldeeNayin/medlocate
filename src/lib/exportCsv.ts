import Papa from 'papaparse';
import type { Hospital, ExportColumn, ExportOptions } from '@/types';

/**
 * Builds a filename like: hospitals-lagos-maternity-2025-06-01.csv
 */
export function buildFilename(query: string, date = new Date()): string {
  const slug = query.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'results';
  const dateStr = date.toISOString().slice(0, 10);
  return `hospitals-${slug}-${dateStr}.csv`;
}

/**
 * Maps a Hospital row to the selected export columns.
 */
function pickColumns(hospital: Hospital, columns: ExportColumn[]): Record<string, string> {
  const map: Record<ExportColumn, string> = {
    name:       hospital.name,
    address:    `${hospital.address}, ${hospital.lga}, ${hospital.state}`,
    phone:      hospital.phone,
    email:      hospital.email ?? '',
    specialties: hospital.specialties.join('; '),
    rating:     `${hospital.rating_avg.toFixed(1)} (${hospital.rating_count} reviews)`,
  };
  return Object.fromEntries(columns.map((col) => [col, map[col]]));
}

/**
 * Triggers a client-side CSV download — no server round-trip.
 */
export function exportHospitalsCsv(
  hospitals: Hospital[],
  options: ExportOptions,
): void {
  const { columns, filename = 'hospitals-export.csv' } = options;
  const rows = hospitals.map((h) => pickColumns(h, columns));
  const csv = Papa.unparse(rows, { header: true });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
