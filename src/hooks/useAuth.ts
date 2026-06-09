import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types';

interface AuthState {
  session: Session | null;
  user:    User | null;
  profile: UserProfile | null;
  loading: boolean;
}

export function useAuth(): AuthState & {
  signIn:  (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp:  (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
} {
  const [state, setState] = useState<AuthState>({
    session: null,
    user:    null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('[useAuth] getSession error:', error.message);
        setState((s) => ({ ...s, loading: false }));
        return;
      }
      if (session?.user) {
        setState((s) => ({ ...s, session, user: session.user }));
        fetchProfile(session.user.id);
      } else {
        setState((s) => ({ ...s, session: null, user: null, loading: false }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((s) => ({ ...s, session, user: session?.user ?? null }));
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setState((s) => ({ ...s, profile: null, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      // PGRST116 = row not found — fine for brand-new users before trigger fires
      if (error && error.code !== 'PGRST116') {
        console.warn('[useAuth] fetchProfile error:', error.message);
      }
      setState((s) => ({ ...s, profile: (data as UserProfile | null) ?? null, loading: false }));
    } catch {
      setState((s) => ({ ...s, profile: null, loading: false }));
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });

    // ── Auth-level error (e.g. weak password from Supabase policy) ──
    if (error) return { error: error as Error | null };

    // ── If the trigger failed to create a profile row, insert it manually ──
    // This is a resilience measure: the auth user exists either way; we just
    // ensure the profile row is there so the app works after email confirmation.
    if (data.user) {
      const userId    = data.user.id;
      const userEmail = data.user.email ?? email;

      const { error: profileErr } = await supabase
        .from('profiles')
        .insert({ id: userId, email: userEmail })
        .select()
        .single();

      // 23505 = unique_violation (profile already created by trigger) — that's fine, ignore it
      // 42501 = RLS violation — log but don't block signup; user can still confirm email
      if (profileErr && profileErr.code !== '23505') {
        console.warn('[useAuth] manual profile insert:', profileErr.message, profileErr.code);
        // Don't surface this as a signup error — the auth account was created successfully.
        // The profile will be created by the trigger once the migration is applied.
      }
    }

    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setState({ session: null, user: null, profile: null, loading: false });
  }

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    isAdmin: state.profile?.role === 'admin',
  };
}
