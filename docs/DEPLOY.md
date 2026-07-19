# Deploy — Letter Path (R-9)

**Goal:** free browser URL family can open without install.

## Stack fit

Static files + CDN Three.js (`importmap` in `index.html`). No build step.

## Recommended: GitHub Pages

From project root:

```bash
cd /mnt/c/Users/datav/Games/LetterPath
chmod +x scripts/deploy-github-pages.sh
./scripts/deploy-github-pages.sh
```

- Creates public repo `letter-path` (override: `REPO_NAME=my-name`)
- Pushes **playable-only** tree (excludes `tools/`, verify PNGs, `.blend`)
- Enables Pages on `main` root
- URL: `https://<github-user>.github.io/letter-path/`

Needs `gh auth login` with `repo` scope.

## Local (always works)

```bash
cd /mnt/c/Users/datav/Games/LetterPath
python3 -m http.server 8080
# http://localhost:8080  (hard-refresh)
```

## Other free options

| Host | Notes |
|------|--------|
| **Netlify Drop** | Drag the folder at https://app.netlify.com/drop |
| **Cloudflare Pages** | Connect the public repo or wrangler |
| **Surge** | `npx surge . your-name.surge.sh` (account once) |

## After deploy checklist

- [ ] Open on phone (touch L/R buttons)
- [ ] Sound works after first tap (autoplay policies)
- [ ] Mute + Letter name/sound toggles
- [ ] Hard-refresh if an old tab is open
