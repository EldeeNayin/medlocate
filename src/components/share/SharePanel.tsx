import { useState } from 'react';
import { Link2, Check, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { buildShareUrl, copyToClipboard } from '@/lib/shareLink';
import type { SearchFilters } from '@/types';

interface SharePanelProps {
  filters: SearchFilters;
  onEmailShare?: (email: string) => Promise<void>;
}

export function SharePanel({ filters, onEmailShare }: SharePanelProps) {
  const [copied, setCopied]     = useState(false);
  const [email, setEmail]       = useState('');
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const shareUrl = buildShareUrl(filters);

  async function handleCopy() {
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleEmailShare() {
    if (!email || !onEmailShare) return;
    setSending(true);
    setError(null);
    try {
      await onEmailShare(email);
      setSent(true);
      setEmail('');
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send email');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4" data-testid="share-panel">
      <h3 className="text-sm font-semibold text-ink">Share results</h3>

      {/* Copy link */}
      <div className="flex gap-2">
        <input
          readOnly
          value={shareUrl}
          className="flex-1 rounded-lg border border-surface-border bg-surface-subtle px-3 py-2 text-xs text-ink-muted font-mono truncate focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Shareable link"
        />
        <Button variant={copied ? 'primary' : 'secondary'} size="sm" onClick={handleCopy} aria-label="Copy link">
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      {/* Email share */}
      {onEmailShare && (
        <div className="space-y-3">
          <div className="flex gap-2 items-end">
            <Input
              type="email"
              label="Send via email"
              placeholder="recipient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="primary"
              size="md"
              onClick={handleEmailShare}
              loading={sending}
              disabled={!email || sent}
            >
              {sent ? <Check className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              {sent ? 'Sent!' : 'Send'}
            </Button>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
}
