# Syrine — Single-app Next.js + SQLite + Drizzle

The public car-rental site and CRM now run in **one Next.js process on port 3000**.
The existing API URL contracts (`/api/...`) are served internally by Next.js route handlers, without a second process, proxy to localhost:3001, or external database server.

## Local installation (Node 22.13+)

```bash
pnpm install
pnpm test:api
pnpm build
pnpm dev
```

Open <http://localhost:3000> and <http://localhost:3000/admin>.
Existing `data/db.json` is imported **once** into `data/syrine.sqlite` (unless `SYRINE_DB_PATH` specifies another path). Original JSON is never overwritten; a `db.json.before-sqlite.bak` copy is also made. **After migration, SQLite is authoritative. Do not run v9 against the old JSON or it will miss bookings made in v10.** `data/.admin-password` is used only for initializing a NEW admin, not for changing an existing user's credentials.

The login remains `admin` with your existing v9 password; on a fresh database read `data/.admin-password` (or the file inside `SYRINE_DATA_DIR`). To reset the admin password (stop the web server first): `pnpm admin:reset`. The script makes a SQLite backup, preserves business records, and revokes the admin's sessions.

## Deployment

For an Ubuntu VPS, generate the standalone ZIP using the included **GitHub Actions Linux release workflow** (or run `pnpm build:deploy` on Linux). Do not deploy a Mac-built standalone ZIP onto Linux. Read `deploy/README.md` for persistent SQLite, backups and uploaded-photo paths.

## Architecture

- Next.js App Router for public pages, CRM, and API route handlers.
- SQLite via Node's built-in `node:sqlite` driver, and Drizzle ORM schema/query adapter (`server/db/schema.mjs`, `server/db/storage.mjs`). WAL + transaction-bound persistence. No native `better-sqlite3` compilation.
- Existing v9 API/business logic retained in-process for compatibility.
- Persistent, hashed admin sessions in SQLite; original credentials migrate with their hashes.
- Uploaded images stored outside the release directory, served by Next.js.

## Safety / current constraints

- **Single Node process only**. The old API mutates an in-memory snapshot and saves normalized SQLite rows transactionally. Running two replicas against the same file can cause lost updates. Do not enable PM2 cluster or multiple app containers.
- The ORM schema is normalized by entity, but complex transactions still use the v9 compatibility controller; a future direct Drizzle service layer could remove this limitation.
- Never commit database files, passwords, session tokens, or customer data.
- Complete a production build and browser QA on the target runtime before calling it production-ready.
# syrine-location
