import { test, expect } from '@playwright/test';
/**
 * RLS policy verification — public user cannot write to hospitals table.
 *
 * These tests use the Supabase client directly; they require a real
 * SUPABASE_URL + SUPABASE_ANON_KEY in your .env.test file to run.
 *
 * Run with: npx playwright test e2e/rls.spec.ts
 */

test.describe('Supabase RLS — public user', () => {
  test('cannot insert a hospital as anonymous user', async ({ request }) => {
    const supabaseUrl  = process.env.VITE_SUPABASE_URL!;
    const anonKey      = process.env.VITE_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !anonKey) {
      test.skip(); // Skip in environments without Supabase configured
      return;
    }

    const response = await request.post(`${supabaseUrl}/rest/v1/hospitals`, {
      headers: {
        apikey:        anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        Prefer:        'return=representation',
      },
      data: { name: 'RLS Test Hospital', city: 'Lagos' },
    });

    // Supabase RLS should block this: expect 401 or 403
    expect([401, 403]).toContain(response.status());
  });
});
