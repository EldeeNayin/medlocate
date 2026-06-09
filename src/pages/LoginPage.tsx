import { useState, type FormEvent } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input }   from '@/components/ui/Input';
import { Button }  from '@/components/ui/Button';

export function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate          = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [visible,  setVisible]  = useState(false);
  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = await signIn(email, password);
    if (err) {
      const msg = err.message.toLowerCase();
      if (msg.includes('invalid login') || msg.includes('invalid credentials') || (msg.includes('email not confirmed') === false && msg.includes('invalid'))) {
        setError('Wrong email or password. Please try again.');
      } else if (msg.includes('email not confirmed')) {
        setError('Verify your email first — we sent a link to your inbox.');
      } else if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('fetch')) {
        setError('Connection problem. Check your internet and try again.');
      } else {
        setError(err.message);
      }
      setBusy(false);
    } else {
      navigate('/', { replace: true });
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-ink">Log in</h1>
          <p className="mt-1 text-sm text-ink-muted">Welcome back to MedLocate.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-card border border-surface-border bg-surface p-6 space-y-4">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type={visible ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            trailing={
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className="text-ink-faint hover:text-ink transition-colors"
                aria-label={visible ? 'Hide password' : 'Show password'}
              >
                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" variant="primary" size="lg" loading={busy} className="w-full">
            Log in
          </Button>
        </form>

        <p className="text-center text-xs text-ink-faint">
          No account?{' '}
          <Link to="/signup" className="text-brand-600 hover:underline">Register for free</Link>.
        </p>
        <p className="text-center text-xs text-ink-faint">
          Just browsing?{' '}
          <Link to="/search" className="text-brand-600 hover:underline">Search facilities</Link> without logging in.
        </p>
      </div>
    </div>
  );
}
