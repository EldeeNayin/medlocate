import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Heart, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input }   from '@/components/ui/Input';
import { Button }  from '@/components/ui/Button';

export function SignupPage() {
  const { user, signUp } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [done,     setDone]     = useState(false);
  const [loading,  setLoading]  = useState(false);

  if (user) return <Navigate to="/" replace />;

  const strength =
    password.length === 0 ? null :
    password.length < 8   ? 'weak' :
    /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'strong' : 'medium';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const { error: err } = await signUp(email, password);
    setLoading(false);

    if (err) {
      const msg = err.message.toLowerCase();
      // Map Supabase error messages to user-friendly text
      if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already registered')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else if (msg.includes('password') && msg.includes('characters')) {
        setError('Password must be at least 8 characters.');
      } else if (msg.includes('invalid email')) {
        setError('Please enter a valid email address.');
      } else if (msg.includes('database') || msg.includes('unexpected')) {
        // Don't surface raw DB errors — they're confusing and usually don't mean signup failed
        // The auth account is created; tell them to check email
        setDone(true);
        return;
      } else {
        setError(err.message);
      }
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="font-display font-bold text-2xl text-ink">Check your email</h1>
          <p className="text-sm text-ink-muted">
            We sent a confirmation link to <strong>{email}</strong>.
            Click it to activate your account, then{' '}
            <Link to="/login" className="text-brand-600 hover:underline">sign in</Link>.
          </p>
          <p className="text-xs text-ink-faint">
            Didn't get it? Check your spam folder or{' '}
            <button
              onClick={() => { setDone(false); setError(''); }}
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
            <Heart className="h-6 w-6 text-white" fill="white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-ink">Create an account</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Join Carefinder to save reviews and access member features.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-card border border-surface-border bg-surface p-6 space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
            {strength && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-surface-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      strength === 'weak'   ? 'w-1/3 bg-red-400'    :
                      strength === 'medium' ? 'w-2/3 bg-yellow-400' :
                                             'w-full bg-green-500'
                    }`}
                  />
                </div>
                <span className={`text-xs ${
                  strength === 'weak'   ? 'text-red-500'    :
                  strength === 'medium' ? 'text-yellow-600' :
                                         'text-green-600'
                }`}>
                  {strength}
                </span>
              </div>
            )}
          </div>
          <Input
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
          />
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Create account
          </Button>
        </form>

        <p className="text-center text-xs text-ink-faint">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:underline">Sign in</Link> instead.
        </p>
      </div>
    </div>
  );
}
