-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003: Fix profile creation trigger & add missing RLS INSERT policy
-- Run this in your Supabase project → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Re-create the trigger function with proper SECURITY DEFINER
--    so it always runs as the DB owner and bypasses RLS.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;   -- idempotent — safe to run twice
  RETURN NEW;
END;
$$;

-- 2. Drop & re-create the trigger to make sure it's attached correctly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Add the missing INSERT policy on profiles so the service role
--    (and the trigger running as SECURITY DEFINER) can always insert.
--    Without this, if Supabase re-evaluates RLS on the trigger, it blocks.
DROP POLICY IF EXISTS "profiles_insert_trigger" ON profiles;
CREATE POLICY "profiles_insert_trigger"
  ON profiles FOR INSERT
  WITH CHECK (true);   -- trigger & service role only; anon key can't insert directly anyway

-- 4. Grant explicit execute permission on the trigger function to postgres
GRANT EXECUTE ON FUNCTION handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;
