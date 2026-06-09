import { Link } from 'react-router-dom';
import { MapPin, Phone, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { RatingWidget } from './RatingWidget';
import type { Hospital } from '@/types';

interface HospitalCardProps {
  hospital: Hospital;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

// Colour coding kept identical so functionality is unchanged, only the card layout differs
const specialtyColor: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'gray'> = {
  maternity:   'blue',
  emergency:   'red',
  dental:      'amber',
  pediatric:   'green',
  cardiology:  'red',
  orthopedics: 'gray',
  oncology:    'amber',
  general:     'gray',
};

export function HospitalCard({ hospital, selected, onSelect }: HospitalCardProps) {
  const ownershipIsPublic = hospital.ownership === 'public';

  return (
    <article
      data-testid="hospital-card"
      className={`
        group flex flex-col gap-2.5 rounded-card border bg-surface p-4
        shadow-card transition-all hover:shadow-card-hover cursor-pointer
        ${selected ? 'border-brand-500 ring-2 ring-brand-200' : 'border-surface-border'}
      `}
      onClick={() => onSelect?.(hospital.id)}
    >
      {/* Top row: name + ownership tag */}
      <div className="flex items-start justify-between gap-3">
        <Link
          to={`/hospital/${hospital.id}`}
          className="font-display font-semibold text-ink text-base leading-snug hover:text-brand-700 transition-colors line-clamp-2"
          onClick={(e) => e.stopPropagation()}
        >
          {hospital.name}
        </Link>
        <span className={`shrink-0 flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-semibold ${
          ownershipIsPublic ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'
        }`}>
          <Building2 className="h-3 w-3" />
          {ownershipIsPublic ? 'Public' : 'Private'}
        </span>
      </div>

      <RatingWidget value={hospital.rating_avg} count={hospital.rating_count} size="sm" />

      {/* Location */}
      <div className="flex items-start gap-1.5 text-sm text-ink-muted">
        <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-ink-faint" />
        <span className="line-clamp-1">{hospital.city}, {hospital.state}</span>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-1.5 text-sm text-ink-muted">
        <Phone className="h-4 w-4 shrink-0 text-ink-faint" />
        <a
          href={`tel:${hospital.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="hover:text-brand-600 transition-colors"
        >
          {hospital.phone}
        </a>
      </div>

      {/* Specialties */}
      {hospital.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1 border-t border-surface-border">
          {hospital.specialties.slice(0, 3).map((s) => (
            <Badge key={s} variant={specialtyColor[s] ?? 'gray'}>{s}</Badge>
          ))}
          {hospital.specialties.length > 3 && (
            <Badge variant="gray">+{hospital.specialties.length - 3} more</Badge>
          )}
        </div>
      )}
    </article>
  );
}
