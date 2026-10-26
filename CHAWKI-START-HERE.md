# Chawki Auto Oran — proposal built from the latest Syrine source (26 Oct 2026)

**Unofficial demo.** Not an authorized Chawki Auto website. Public phone & Google Maps location are from a screenshot shared by the user. Email, Facebook/Instagram, stock, rates, rental policies, reviews and airport service are **not confirmed**. The original Syrine fleet remains illustrative only. Online reservation and contact form submissions are disabled. The app is noindex and robots-disallowed.

## Run on Mac

Node >=22.13, pnpm 10. `cp .env.local.example .env`; `pnpm install --frozen-lockfile`; `pnpm test:api`; `pnpm build`; `pnpm dev --port 3001`.

## New git repo

```sh
git init -b main
git add .
git commit -m "feat: Chawki Auto Oran independent demo from latest Syrine template"
git remote add origin git@github.com:YOUR_USERNAME/chawki-auto-oran-demo.git
git push -u origin main
```
Create an empty *private* repository yourself before `git push`. **Don't push this to `syrine-location`**.

## Ubuntu VPS: SECOND app, preserves Syrine & other services

First create a new private GitHub repo and push the Chawki files. Then on Ubuntu:

```sh
cd ~
git clone git@github.com:YOUR_USERNAME/chawki-auto-oran-demo.git chawki-auto
cd ~/chawki-auto
source ~/.nvm/nvm.sh
nvm use 22
mkdir -p "$HOME/chawki-data/uploads"
cp .env.example .env
chmod 600 .env
pnpm install --frozen-lockfile
pnpm test:api && pnpm build
mkdir -p .next/standalone/public .next/standalone/.next/static
cp -a public/. .next/standalone/public/
cp -a .next/static/. .next/standalone/.next/static/
set -a; source .env; set +a
export PORT=3101 HOSTNAME=127.0.0.1
pm2 start .next/standalone/server.js --name chawki-auto --interpreter "$(command -v node)"
curl -fsS http://127.0.0.1:3101/api/health
```

Only when local health returns 200, create a NEW nginx config, don't overwrite Syrine/CapCompare:

```sh
sudo tee /etc/nginx/sites-available/chawki-auto > /dev/null <<'EOF'
server {
  listen 80;
  server_name chawki.197-140-41-13.nip.io;
  client_max_body_size 15M;
  location / {
    proxy_pass http://127.0.0.1:3101;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
EOF
sudo ln -s /etc/nginx/sites-available/chawki-auto /etc/nginx/sites-enabled/chawki-auto
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d chawki.197-140-41-13.nip.io --redirect
curl -i https://chawki.197-140-41-13.nip.io/api/health
pm2 save
```

**IMPORTANT**: the .env copied from .env.example references `/home/ubuntu/chawki-data`, *never* `/home/ubuntu/syrine-data`. `PORT=3101`; `PUBLIC_ORIGIN` matches Chawki demo domain. Use an exclusive database. Do not point this demo at the existing Syrine database. If using HTTPS, ports 80/443 must be reachable and nip.io must resolve to VPS IP. PM2 uses **one process only** (SQLite snapshot behavior).

**Admin password:** freshly generated for new DB (see `$HOME/chawki-data/.admin-password`), or `pnpm admin:reset` when stopped. Never publish admin credentials openly or reuse Syrine admin password. No private customer data is included.

## After a future code change

```sh
cd ~/chawki-auto
pm2 stop chawki-auto
git pull --ff-only origin main
pnpm install --frozen-lockfile
pnpm test:api && pnpm build
mkdir -p .next/standalone/public .next/standalone/.next/static
cp -a public/. .next/standalone/public/
cp -a .next/static/. .next/standalone/.next/static/
set -a; source .env; set +a
export PORT=3101 HOSTNAME=127.0.0.1
pm2 restart chawki-auto --update-env
curl -fsS http://127.0.0.1:3101/api/health
pm2 save
```

## Before presenting to the owner

- Identify it as a design proposal, not the official agency website.
- The phone **0542 42 76 39** and location are from the Google Maps screenshot. Verify that WhatsApp is attached to this number before claiming it is.
- **No verified business email was found**, so the demo intentionally hides email/TikTok links.
- Demonstration car images and pricing are illustrative from the original template, **not** the agency's real fleet. Replace them only with images the owner authorizes; agree on real services, policies, and photos before publishing a production site.
- Private admin demo logins should not be shared publicly, and never use production customer data.
