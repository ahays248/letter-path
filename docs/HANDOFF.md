# Handoff — Letter Path

**Updated:** 2026-07-19 (R-7 + R-6b + R-9 shipped)  
**For phrase:** “check the latest handoff”

## Last session (2026-07-19) — summary

- **R-7:** On-screen **Left/Right** buttons + canvas swipe; parent **Letter: name/sound** (gear menu); mute persists  
- **R-6b (revised):** Per-letter text **removed** (chime + VO + strip). Bottom **toast** only for word/set complete. Thin center-top stars/strip so mobile animal stays clear.  
- **R-9:** Public family URL via GitHub Pages  
  - **Play URL:** https://ahays248.github.io/letter-path/  
  - **Repo:** https://github.com/ahays248/letter-path  
  - Redeploy: `./scripts/deploy-github-pages.sh` (see `docs/DEPLOY.md`)  
- **R-11 / R-12:** Design parking only → `docs/superpowers/specs/2026-07-19-r11-r12-design-notes.md` (no code)

## This session goal (NEXT)

Pick **one**:

1. **R-8** — phone/family playtest on the live URL (touch + audio)  
2. **R-11 design** — approve reward hub + dog before code  
3. **R-12 design** — approve bow shoot toy mode before code  
4. Polish from playtest notes  

## Run (local)

```bash
cd /mnt/c/Users/datav/Games/LetterPath
python3 -m http.server 8080
# http://localhost:8080  (hard-refresh)
```

**Family share:** https://ahays248.github.io/letter-path/

**Flow:** Animal still → Go! → L/R (keys, buttons, or swipe) → spell gates → video → … → set complete → bow on **back**.

## Debug

| Call | Meaning |
|------|---------|
| `hasBow()` | Unlock |
| `getLetterMode()` / `setLetterMode('name'\|'sound')` | VO mode |
| `getBowSource()` | `blender-glb` / `code` |
| `getBowVersion()` | `4` if taut-string load path |
| `getBowCarry()` / `setBowCarry({})` | Live back-carry knobs |
| `getBowSockets()` | `{ hand, nock }` |
| `localStorage.removeItem('letterPath.unlocked')` | Re-test unlock |
| `localStorage.removeItem('letterPath.muted')` | Clear mute |
| `localStorage.removeItem('letterPath.letterMode')` | Clear name/sound |

## Doc load (token budget)

1. This HANDOFF  
2. **session-load-map** → open **only** that session kind  
3. LESSONS matching **§** only  
4. R-11/R-12 → design notes above, not asset deep-dives unless art  

## Backlog

R-8 playtest · **R-6e** better VO via GB10 open models ([research-todo-local-sfx-tts-2026.md](../../docs/game-design/research-todo-local-sfx-tts-2026.md)) · R-11 dog hub (design first) · R-12 shoot (design first) · character polish · AI license at commercial ship  

**Audio notes (2026-07-19):** letter VO on gate commit; toast is visual-only (no second TTS); name/sound only via gear (not **L** key). ElevenLabs Creator ≠ API for us → local models research parked.
