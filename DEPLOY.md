# Deploy Meridian

Two paths to a public URL. Both run the same Next.js standalone build;
only the ingress in front changes.

---

## Path A — fast public URL (~30 seconds)

Use this when you want a public URL without touching DNS.

```bash
cd ~/meridian
npm run build
# Start the production server on 127.0.0.1:3000
cd .next/standalone
nohup node server.js -p 3000 -H 127.0.0.1 &

# Tunnel via Cloudflare's free quick-tunnel
cloudflared tunnel --url http://127.0.0.1:3000
#  →  https://<random>.trycloudflare.com
```

The URL is saved to `meridian/.tunnel-url`. URLs here are ephemeral —
when `cloudflared` exits, the URL stops resolving.

---

## Path B — `meridian.sithunyein.com` (custom domain)

Three steps.

### 1. Add `sithunyein.com` (or just `meridian.sithunyein.com`) to Cloudflare

If the zone isn't on Cloudflare yet:

1. Sign in to https://dash.cloudflare.com
2. Add the zone: `sithunyein.com`
3. Update the nameservers at your registrar to the ones Cloudflare shows
4. Wait for the zone to activate (a few minutes)

### 2. Create a long-lived named Tunnel

```bash
# one-time
cloudflared tunnel login
cloudflared tunnel create meridian
# →  Copy the UUID + creds file path

# config — write to ~/.cloudflared/config.yml
# or %USERPROFILE%\.cloudflared\config.yml on Windows
tunnel: <UUID>
credentials-file: <path-to-credentials.json>
ingress:
  - hostname: meridian.sithunyein.com
    service: http://127.0.0.1:3000
  - service: http_status:404
```

### 3. Add the DNS record + start the Tunnel

```bash
cloudflared tunnel route dns meridian meridian.sithunyein.com
# → A 'meridian' → <tunnel-uuid>.cfargotunnel.com (auto-created)

cloudflared tunnel run meridian
```

`https://meridian.sithunyein.com` now resolves to the Node server on
your machine. Future restarts just need `cloudflared tunnel run meridian`.

### Optional — keep the tunnel + server alive on reboot

Use `pm2`, `nssm`, Task Scheduler, or a Windows scheduled task to
re-run:

```
node C:\Users\sithu\meridian\.next\standalone\server.js -p 3000 -H 127.0.0.1
cloudflared tunnel run meridian
```

on every boot.

---

## URLs

| URL                                                       | What serves                                |
|-----------------------------------------------------------|--------------------------------------------|
| `https://github.com/thesithunyein/meridian`               | The repo. Apache-2.0.                       |
| `https://meridian.sithunyein.com`                         | Named tunnel + your DNS. Permanent.        |
| `https://<random>.trycloudflare.com`                      | Quick-tunnel. Free. Ephemeral.              |

---

## Environment variables

When `node server.js` starts, set:

```
HYDRADB_URL=https://api.hydradb.com
HYDRADB_API_KEY=hk_live_…
HYDRADB_GRAPH=meridian
HYDRADB_CELL_ID=cell-0
```

`/api/health` then flips from `source: fixture:deterministic-v1` to
`source: hydradb:https://api.hydradb.com`. No reload needed.

---

## Cost

- Domain — your existing `sithunyein.com`
- Cloudflare free tier — Tunnel + DNS + HTTPS — $0
- Node process on this machine — $0
- HydraDB Cloud (when wired) — free hobby tier

Total: **$0 to run, $0/month to keep.**
