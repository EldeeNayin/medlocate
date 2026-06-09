# MedLocate Nigeria 🏥

A civic health directory for finding, exporting, and sharing clinic and hospital information across Nigeria.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Add your Supabase and Resend keys (no map token needed — Leaflet is free)

# 3. Run database migrations
# In the Supabase SQL Editor, run each file in order:
#   supabase/migrations/001_init.sql
#   supabase/migrations/002_rls.sql
#   supabase/migrations/003_fix_profiles_trigger.sql

# 4. Start dev server
npm run dev
```

## Project structure

```
src/
├── components/
│   ├── admin/         # AdminEntryForm
│   ├── hospital/      # HospitalCard, HospitalMap, RatingWidget
│   ├── layout/        # AppShell, SearchLayout
│   ├── search/        # SearchBar, FilterPanel
│   ├── share/         # CsvExportPanel, SharePanel
│   └── ui/            # Button, Input, Badge, Spinner
├── hooks/
│   ├── useAuth.ts         # Supabase auth + admin role
│   ├── useGeolocation.ts  # Browser Geolocation API wrapper
│   └── useHospitals.ts    # Supabase queries + PostGIS radius search
├── lib/
│   ├── exportCsv.ts    # Client-side CSV export via PapaParse
│   ├── shareLink.ts    # URL encode/decode + clipboard helper
│   ├── supabase.ts     # Supabase client
│   └── validation.ts   # Zod schemas
├── pages/
│   ├── AdminPage.tsx
│   ├── HomePage.tsx
│   ├── HospitalDetailPage.tsx
│   ├── LoginPage.tsx
│   ├── SearchPage.tsx
│   └── SignupPage.tsx
├── test/               # Vitest unit + component tests
└── types/index.ts      # Shared TypeScript types

e2e/                    # Playwright end-to-end tests
supabase/migrations/    # SQL migrations (PostgreSQL + PostGIS + RLS)
api/                    # Vercel serverless functions
```

## Services

### Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Enable the **PostGIS** extension under Database → Extensions
3. Run the migration files in order
4. Copy the Project URL and anon key into `.env`

### Leaflet (map)
No API key or account needed — Leaflet is a free, open-source mapping library.
Tile data is served from [OpenStreetMap](https://www.openstreetmap.org) by default, which is also free to use.

Install the packages if not already present:
```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

Set the tile URL in `.env` if you want to use a custom tile provider:
```env
VITE_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_TILE_ATTRIBUTION=© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors
```

If these variables are not set, the map will fall back to the default OpenStreetMap tiles automatically.

### Resend (email sharing)
1. Create an API key at [resend.com](https://resend.com)
2. Set `RESEND_API_KEY` as a server-side env var in your deployment (not in `.env` — keep it secret)
3. Deploy with Vercel: the `api/send-email.ts` function handles the server-side email send

## Testing

```bash
npm test          # Vitest unit + component tests
npm run test:e2e  # Playwright e2e (requires dev server running)
```

## Deploy

```bash
vercel deploy
# Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, RESEND_API_KEY in Vercel
# VITE_TILE_URL and VITE_TILE_ATTRIBUTION are optional — defaults to OpenStreetMap
```
