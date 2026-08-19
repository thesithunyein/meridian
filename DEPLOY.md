# Deploy Meridian to `meridian.sithunyein.com`

Two paths exist. Both run the same Next.js standalone build; only the
ingress in front changes.

---

## Path A — instant demo URL (~30 s, free)

Best for a working demo URL with no DNS work.

```bash
cd ~/meridian
npm run build
# Start the production server on 127.0.0.1:3000
cd .next/standalone
nohup node server.js -p 3000 -H 127.0.0.1 &

# Tunnel it via Cloudflare's free quick-tunnel
cloudflared tunnel --url http://127.0.0.1:3000
#  →  https://<random>.trycloudflare.com
```

The current live tunnel URL is saved to `meridian/.tunnel-url`. URLs are
ephemeral — when `cloudflared` exits the URL stops resolving.

---

## Path B — `meridian.sithunyein.com` (custom domain)

Requires three small steps.

### 1. Add `sithunyein.com` (or just `meridian.sithunyein.com`) to Cloudflare

If the zone isn't on Cloudflare yet:

1. Sign in to https://dash.cloudflare.com
2. Add the zone: `sithunyein.com`
3. Update the nameservers at your registrar to the Cloudflare ones
4. Wait for the zone to activate (a few minutes)

### 2. Create a long-lived named Tunnel

```bash
# one-time
cloudflared tunnel login
cloudflared tunnel create meridian
# →  Copy the UUID + creds file path

# config — write to ~/.cloudflared/config.yml (or %USERPROFILE%\.cloudflared\config.yml)
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

# now start the tunnel
cloudflared tunnel run meridian
```

Once the tunnel is up, `https://meridian.sithunyein.com` resolves to the
Node server running on `127.0.0.1:3000` on your machine. The next deploy
just needs `cloudflared tunnel run meridian` again.

### Optional — keep the tunnel + server alive on reboot

Use `pm2`, `nssm`, `Task Scheduler`, or a simple Windows scheduled task to
re-run:

```
node C:\Users\sithu\meridian\.next\standalone\server.js -p 3000 -H 127.0.0.1
cloudflared tunnel run meridian
```

on every boot.

---

## What you'll see

| URL                                                       | What serves                       |
|-----------------------------------------------------------|-----------------------------------|
| `https://github.com/thesithunyein/meridian`               | This repo, Apache-2.0             |
| `https://treated-carter-gmc-employer.trycloudflare.com`   | Trycloudflare tunnel, free, ephemeral |
| `https://meridian.sithunyein.com`                         | Named tunnel + your DNS, permanent |

---

## When you wire env

Set these in the same shell where `node server.js` runs:

```
HYDRADB_URL=https://api.hydradb.com
HYDRADB_API_KEY=hk_live_…
HYDRADB_GRAPH=meridian
HYDRADB_CELL_ID=cell-0
```

…and `/api/health` flips from `source: fixture:deterministic-v1` to
`source: hydradb:https://api.hydradb.com`. No reload needed.

---

## Cost

- Domain — your existing `sithunyein.com`
- Cloudflare (free tier) — Tunnel + DNS + HTTPS — $0
- Node process on this machine — $0
- HydraDB Cloud (when wired) — free hobby tier

Total: **$0 for the demo, $0/month after**.
