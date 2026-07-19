# Agent handoff — Letter Path

## “Check the latest handoff”

1. **`docs/HANDOFF.md`** first  
2. **[session-load-map.md](/mnt/c/Users/datav/Games/docs/game-design/session-load-map.md)** — pick **one** session kind  
3. Open **only** the docs for that kind (do not load the full library)

## Default start (any session)

| Always (small) | Then by kind |
|----------------|--------------|
| HANDOFF | See load map |
| ROADMAP **active chunk** only | |
| LESSONS **§ for this work** only | § gameplay / § assets / § product |

Do **not** open asset-generation-process, Blender MCP notes, or pose tuning unless the chunk is art/pose.

## Design (load if changing fantasy/loop)

- Spec: `docs/superpowers/specs/2026-07-17-letter-path-design.md`  
- Audience: kids/family ~6yo (**explicit**) · stack: **Three.js browser**

## By session kind (Letter Path)

### Gameplay / features (R-7, spelling, HUD, …)

- `docs/LESSONS_LEARNED.md` → **§ gameplay**  
- `docs/TDD.md` if architecture  

### Assets / bow / 3D / Imagine

1. [asset-generation-process.md](/mnt/c/Users/datav/Games/docs/game-design/asset-generation-process.md) (classify → SOURCE → **Step 1b** if Imagine 2D)  
2. LESSONS → **§ assets**  
3. `docs/ASSETS.md`  
4. Imagine 2D (animals, UI, sprites): load `game-asset-core` + specialist from `~/.grok/bundled/skills/`  
5. Depth only as needed: pose → [visual-pose-tuning.md](/mnt/c/Users/datav/Games/docs/game-design/visual-pose-tuning.md); tools → art-toolbelt; sockets → low-poly-assets-and-animation  

**Quick facts (no extra files):** bow = GLB v3+ taut string, back carry `BOW_CARRY` locked trial B; `setBowCarry` for live knobs; sockets for R-12. Animals = Imagine still/video billboards (not mesh skills).

### Playtest / product

- LESSONS → **§ product** · `docs/PLAYTESTS.md`

### Do not without named chunk

- Dog hub / walk (R-11) · bow shoot (R-12)

## Run

```bash
cd /mnt/c/Users/datav/Games/LetterPath && python3 -m http.server 8080
```

## Git

Local repo yes · remote only if Aaron asks  
