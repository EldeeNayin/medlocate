import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Stethoscope, MapPin, ShieldCheck, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button }  from '@/components/ui/Button';

export function AppShell() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-subtle">
      <header className="sticky top-0 z-30 border-b border-surface-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-4">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Stethoscope className="h-4 w-4 text-white" />
            </span>
            <span className="font-display font-bold text-ink text-lg tracking-tight">MedLocate</span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
                }`
              }
            >
              <MapPin className="h-4 w-4" />
              Find facilities
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
                  }`
                }
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </NavLink>
            )}
          </nav>

          {/* Auth */}
          {!loading && (
            <div className="flex items-center gap-2">
              {user ? (
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Log out</span>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/signup')}>
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Register</span>
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Log in</span>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-surface-border bg-surface py-4 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} MedLocate · Connecting Nigerians to healthcare
      </footer>
    </div>
  );
}
