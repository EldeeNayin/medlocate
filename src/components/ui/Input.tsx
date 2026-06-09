import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:   string;
  error?:   string;
  hint?:    string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leading, trailing, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leading && (
            <span className="absolute left-3 text-ink-faint pointer-events-none">{leading}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={clsx(
              'w-full rounded-lg border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint',
              'transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
              error ? 'border-danger focus:ring-danger' : 'border-surface-border',
              leading && 'pl-9',
              trailing && 'pr-9',
              className,
            )}
            {...props}
          />
          {trailing && (
            <span className="absolute right-3 text-ink-faint">{trailing}</span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-ink-faint">
            {hint}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
