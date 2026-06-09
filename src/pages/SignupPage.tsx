import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Stethoscope, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input }   from '@/components/ui/Input';
import { Button }  from '@/components/ui/Button';

type PasswordStrength = 'weak' | 'moderate' | 'strong';

function measureStrength(pw: string): PasswordStrength | null {
  if (!pw) return null;
  if (pw.length < 8) return 'weak';
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 'strong';
  return 'moderate';
}

export function SignupPage() {
  const { user, signUp } = useAuth();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [error,        setError]        = useState('');
  const [complete,     setComplete]     = useState(false);
  const [busy,         setBusy]         = useState(false);

  if (user) return <Navigate to="/" replace />;

  const strength = measureStrength(password);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setBusy(true);
    const { error: err } = await signUp(email, password);
    setBusy(false);

    if (err) {
      const msg = err.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already registered')) {
        setError('An account with that email already exists. Try logging in.');
      } else if (msg.includes('invalid email')) {
        setError('Please enter a valid email address.');
      } else if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('fetch')) {
        setError('Connection problem. Check your internet and try again.');
      } else if (msg.includes('database') || msg.includes('unexpected')) {
        setComplete(true);
      } else {
        setError(err.message);
      }
    } else {
      setComplete(true);
    }
  }

  if (complete) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="font-display font-bold text-2xl text-ink">Check your inbox</h1>
          <p className="text-sm text-ink-muted">
            A confirmation link has been sent to <strong>{email}</strong>.
            Open it to activate your account, then{' '}
            <Link to="/login" className="text-brand-600 hover:underline">log in</Link>.
          </p>
          <p className="text-xs text-ink-faint">
            Can't find it? Check spam, or{' '}
            <button
              onClick={() => { setComplete(false); setError(''); }}
              className="text-brand-600 hover:underline"
            >
              try again
            </button>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-ink">Create account</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Register to submit reviews and access member features.
          </p>
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

          <div className="space-y-1.5">
            <Input
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="text-ink-faint hover:text-ink transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            {strength && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-surface-muted overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${
                    strength === 'weak'     ? 'w-1/3 bg-red-400'    :
                    strength === 'moderate' ? 'w-2/3 bg-yellow-400' :
                                             'w-full bg-green-500'
                  }`} />
                </div>
                <span className={`text-xs font-medium ${
                  strength === 'weak'     ? 'text-red-500'    :
                  strength === 'moderate' ? 'text-yellow-600' :
                                           'text-green-600'
                }`}>
                  {strength}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Input
              label="Confirm password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="text-ink-faint hover:text-ink transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            {confirmation.length > 0 && (
              <p className={`text-xs ${password === confirmation ? 'text-green-600' : 'text-red-500'}`}>
                {password === confirmation ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          {error && <p role="alert" className="text-sm text-danger">{error}</p>}

          <Button type="submit" variant="primary" size="lg" loading={busy} className="w-full">
            Register
          </Button>
        </form>

        <p className="text-center text-xs text-ink-faint">
          Already registered?{' '}
          <Link to="/login" className="text-brand-600 hover:underline">Log in</Link>.
        </p>
      </div>
    </div>
  );
}
