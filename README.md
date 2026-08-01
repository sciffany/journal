# Journal

A private, single-user daily notebook. Every entry (journal, movie rating, idea, todo, gratitude, etc.) lives in one `Entry` table and can be browsed as a per-type grid or a per-date view.

**Stack:** Next.js 16 (App Router) · Neon (Postgres) · Prisma · Tailwind CSS · Vercel  
**Auth:** Shared app password (signed cookie session)

## Local setup

### 1. Create a Neon project

1. Go to <https://console.neon.tech> and create a project.
2. From **Connection details**, copy:
   - **Pooled** connection string → `DATABASE_URL`
   - **Direct** connection string → `DIRECT_URL`

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in:

| Variable       | Purpose                                                              |
| -------------- | -------------------------------------------------------------------- |
| `DATABASE_URL` | Neon pooled Postgres URL (runtime)                                   |
| `DIRECT_URL`   | Neon direct Postgres URL (migrations)                                |
| `APP_PASSWORD` | The password you type at `/login`                                    |
| `AUTH_SECRET`  | Random string that signs session cookies (`openssl rand -base64 32`) |

### 3. Install & migrate

```bash
npm install
npm run db:migrate   # first run creates the "entries" table
npm run dev
```

The app runs at <http://localhost:3000>. You'll be redirected to `/login` — enter `APP_PASSWORD`.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Import Project** and pick the repo.
3. Under **Environment Variables**, add all four vars from `.env.local` (Production + Preview).
4. Deploy. `npm install` runs `prisma generate` via `postinstall`, and `npm run build` runs `prisma generate && next build`.
5. Apply migrations against production:

   ```bash
   npm run db:deploy
   ```

## Adding a new entry type

Just add one line to [lib/types.ts](lib/types.ts):

```ts
{ slug: "workouts", label: "Workouts", icon: Dumbbell },
```

The sidebar, home dashboard, grid, and day view all pick it up automatically. No schema change needed since types are stored as a `String` and per-type fields live in the `metadata` JSON column.

## Routes

- `/` — Home dashboard: tile per type with counts, plus a "Today" link
- `/login` — Shared-password sign-in (only public route)
- `/<type>` — Grid view for a type (e.g. `/journal`, `/movies`)
- `/<type>/new` — New entry form
- `/<type>?e=<id>` — Grid view with the edit modal open
- `/day/<YYYY-MM-DD>` — All entries on that date, grouped by type
- `/auth/sign-out` — POST to sign out

## Project structure

```
app/
  (app)/                 # authenticated app shell (sidebar layout)
    page.tsx             # home dashboard
    [type]/page.tsx      # grid view
    [type]/new/page.tsx  # new entry form
    day/[date]/page.tsx  # per-date view
  actions/entries.ts     # server actions (create/update/delete/list)
  actions/auth.ts        # shared-password login action
  auth/sign-out/route.ts # POST handler
  login/                 # unauthenticated login page
components/
  EntryEditor.tsx        # shared edit modal (opened via ?e=<id>)
  EntryGrid.tsx          # sortable table
  Sidebar.tsx            # left nav
  ui/                    # shadcn-style primitives
lib/
  prisma.ts              # Prisma singleton
  types.ts               # ENTRY_TYPES registry (edit this to add a type)
  utils.ts               # cn(), date helpers
  auth/                  # cookie session helpers
prisma/schema.prisma
proxy.ts                 # Next.js 16 proxy — auth gate
```

## Non-goals (v1)

- No image upload / photos type
- No per-type custom forms (everything uses generic title + body + metadata)
- No multi-user accounts — one shared password, gated at the session layer
