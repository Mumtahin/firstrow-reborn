# FirstRow

Find your next jamaat nearby. A mobile-first web app for Muslims to discover nearby mosques and see upcoming jamaat (congregation) times — ranked by how likely you are to make it in time.

Live at [firstrow.uk](https://firstrow.uk)

---

## Stack

- **Next.js 16** — App Router, Server Components, Server Actions
- **TypeScript** — strict mode
- **Tailwind CSS v4**
- **Drizzle ORM** + **Neon** (serverless Postgres)
- **NextAuth v5** — Google OAuth
- **Mapbox GL** (`react-map-gl`) — mosque map
- **Vitest** — unit tests

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `env.example` to `.env.local` and fill in the values:

```bash
cp env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public token |
| `AUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |

### 3. Run migrations and seed

```bash
npm run db:migrate   # apply schema migrations
npm run db:seed      # seed 6 mosques with 10 days of prayer times
```

### 4. Start the dev server

```bash
npm run dev
```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run db:generate` | Generate a new Drizzle migration |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio (DB browser) |
| `npm run db:seed` | Seed the database |
| `npm run format` | Format with Prettier |
| `npm run lint` | Lint with ESLint |

---

## Project structure

```
src/
  app/               # Next.js routes (App Router)
    mosque/[slug]/   # Mosque detail page
    favourites/      # Saved mosques page
    sign-in/         # Google sign-in page
    api/auth/        # NextAuth route handler
    actions.ts       # Server actions (toggle favourite)
  components/        # Shared UI components
  lib/
    db/              # Drizzle schema, queries, migrations, seed
    utils/           # Pure helpers (getNextJamaat, distance, feasibility, formatCountdown)
  types/             # TypeScript type augmentations
```

---

## Auth setup

Google OAuth requires two redirect URIs in [Google Cloud Console](https://console.cloud.google.com):

```
http://localhost:3000/api/auth/callback/google
https://your-domain.vercel.app/api/auth/callback/google
```
