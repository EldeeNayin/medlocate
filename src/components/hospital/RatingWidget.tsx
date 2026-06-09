import { useState } from 'react';
import clsx from 'clsx';

interface RatingWidgetProps {
  /** Current value (controlled display) */
  value?: number;
  /** Total number of reviews */
  count?: number;
  /** If true, renders interactive stars for submission */
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };

export function RatingWidget({ value = 0, count, interactive = false, onChange, size = 'md' }: RatingWidgetProps) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex items-center gap-1.5" data-testid="rating-widget">
      <div className="flex" aria-label={`Rating: ${value.toFixed(1)} out of 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            disabled={!interactive}
            aria-label={interactive ? `Rate ${star} stars` : undefined}
            onClick={() => interactive && onChange?.(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            className={clsx(
              'transition-colors',
              interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default pointer-events-none',
            )}
          >
            <svg className={clsx(sizes[size], display >= star ? 'text-amber-400' : 'text-surface-border')} viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.35 2.438c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.664 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.957z" />
            </svg>
          </button>
        ))}
      </div>
      {count != null && (
        <span className="text-sm text-ink-muted">
          {value.toFixed(1)} <span className="text-ink-faint">({count})</span>
        </span>
      )}
    </div>
  );
}
