<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cloud Agent

Boot starts local PostgreSQL 16 and `npm run dev` on port 3000. The app is at http://localhost:3000. Sign in with password `journal-dev`.

`/workspace/.env` is created on boot when missing: local `DATABASE_URL` and `DIRECT_URL` for database `journal`, `APP_PASSWORD=journal-dev`, and a generated `AUTH_SECRET`. `npx prisma migrate deploy` runs on boot. Data stays in this VM.
