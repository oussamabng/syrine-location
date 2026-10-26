# Syrine · single-VPS production deployment

## One-time server setup (Ubuntu + Node.js 22.13+)

- Configure a VPS with Node.js 22.13 or newer, Nginx and PM2 (or systemd).
- Create a non-root service account `syrine` and a persistent folder `/var/lib/syrine`, owned by that account (mode 0700).
- Configure HTTPS at Nginx; set `proxy_set_header X-Real-IP $remote_addr;`, `Host`, `X-Forwarded-Proto`, and proxy requests to `127.0.0.1:3000`. Do not expose port 3000 publicly.
- In each release, set environment variables `SYRINE_DB_PATH=/var/lib/syrine/syrine.sqlite`, `SYRINE_DATA_DIR=/var/lib/syrine`, `SYRINE_UPLOAD_DIR=/var/lib/syrine/uploads`, `PUBLIC_ORIGIN=https://YOUR-REAL-DOMAIN`. They must be accessible to the Node process; never package the .env file in the release.
- Before first launch on the VPS, migrate production data: copy your existing `data/db.json` to the first release's `data/db.json` **or** migrate locally and copy the resulting `syrine.sqlite` (and any `-wal`/`-shm` alongside a stopped process) to `/var/lib/syrine/syrine.sqlite`.
- Uploaded images are stored in `/var/lib/syrine/uploads`; copy previous uploads there. The application serves them at `/uploads/*`.
- Create one PM2 service pointing to `node /opt/syrine/current/server.js` and set working directory to `/opt/syrine/current` with `PORT=3000`, `HOSTNAME=127.0.0.1`. **Run only one instance**, no cluster.

## Every release

1. On your Mac run `pnpm install`, `pnpm test:api`, `pnpm build`. For a Linux VPS, **generate the production ZIP on Linux**: trigger `.github/workflows/syrine-release.yml` in GitHub Actions, or run `pnpm build:deploy` on Ubuntu. Download the Linux-built ZIP. macOS-built Next standalone dependencies might not work on Ubuntu.
2. Copy the `Syrine-Production-*.zip` to the VPS. Back up SQLite via `node scripts/backup-db.mjs` in the release (or `pnpm db:backup` in source); back up `/var/lib/syrine/uploads` as well.
3. Extract into a NEW `/opt/syrine/releases/<version>` folder, point `/opt/syrine/current` at the release, then `pm2 restart syrine --update-env`.
4. Check `/api/health`, homepage, vehicle reservation, admin login, settings, uploads, and rental calendar.
5. Roll back by moving the `current` symlink to the old release. **Never roll back the database without checking schema compatibility.**

## Operational requirements

- Rotate the initial admin password (especially if it was ever pasted into a chat or ticket).
- Backups must include database **and uploads**, be encrypted/off-site, with periodic test restores.
- Add Nginx request-size limits, rate limits, a firewall, process monitoring, and security headers.
- Store admin sessions in SQLite; HTTPS is required for Secure cookies in production. Backups and admin-reset scripts load `.env` / `.env.local` when present; otherwise export deployment environment variables before running them.
- No zero-downtime multi-instance deploys: the snapshot-compatibility adapter is designed for a single process. For multiple instances, replace it with row-oriented transactional Drizzle services.
- `pnpm build:deploy` requires `zip` and runs on Linux by default to avoid cross-platform Next.js dependencies. `ALLOW_NON_LINUX_PACKAGE=1` is an explicit override for non-Linux targets/testing, not recommended for Ubuntu deployment.
- The project has been designed for this architecture but requires a successful production build, full browser QA, security review, and restored-backup test before serving real customers.
