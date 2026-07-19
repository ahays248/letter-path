# Assets — Letter Path

## Mode

- **Presentation:** 3D low-poly path (Three.js) + Imagine animal portraits on goal sign  
- **Packs:** none required  
- **3D toolbelt (workspace):** [`docs/game-design/art-toolbelt-3d.md`](../../docs/game-design/art-toolbelt-3d.md) — pick path by asset type  

### 3D authoring paths (R-6c)

| Path | Use when | LetterPath setup |
|------|----------|------------------|
| **img2threejs** | Hard-surface / stylized props as **code** (bow, toys) | Skill `~/.grok/skills/img2threejs`; project `tools/img2threejs/`; factory example `src/models/createToyBow.js` |
| **Blender MCP → glTF** | Organic / hero / pet dog; real meshes | `tools/blender-mcp/README.md`; export `.glb` → `assets/models/` + `GLTFLoader` |
| **Imagine billboard** | Goal animal still/video | `assets/animals/` (already shipped) |

### Blender → Three.js (conventions)

| Step | Rule |
|------|------|
| Export | glTF 2.0 **`.glb`**, applied scale, Y-up |
| Folder | `assets/models/` |
| Runtime | `GLTFLoader` via `src/models/loadBowGlb.js` |
| Current | **`assets/models/bow-blender.glb`** — **v3 modular** (hierarchy + sockets; `?v=3` cache bust) |
| v2 backup | `bow-blender-v2.glb` + `bow-blender-v2.blend` |
| v1 backup | `bow-blender-v1.glb` (primitive stack; lost A/B to code) |
| Recovery | `bow-blender-v3.blend` |
| Keep procedural | Code bow stays as fallback if GLB fails (`createToyBow.js`) |

### Bow v3 hierarchy (GLB node names)

| Node | Role |
|------|------|
| `LetterPathBow` | Root empty |
| `Limb`, `LimbTip_*` | Wood limb |
| `Grip`, `GripBand_*` | Teal wrap |
| `String`, `TipWrap_*` | Rope (separate for future draw) |
| `Arrow`, `ArrowShaft`, `ArrowTip` | Rest arrow (hidden on hand equip) |
| `socket_hand` | Attach / hand pivot |
| `socket_nock` | Arrow spawn / string pull |

Loader: `src/models/loadBowGlb.js` → `userData.sockets` / `userData.parts`. Debug: `__letterPathDebug.getBowSockets()`.

### img2threejs → Three.js (conventions)

| Step | Rule |
|------|------|
| Reference | Imagine or photo; keep under `tools/img2threejs/refs/` + optional `assets/generated/` |
| Factory | Vanilla ESM `src/models/createX.js` returning `THREE.Group` (TS showcase ports to JS) |
| Preview | `tools/img2threejs/preview.html` pattern |
| Runtime | Import factory; optional offline compare: `src/models/bowCompare.js` (not loaded in main) |

### Bow (runtime)

| Asset | Path |
|-------|------|
| Code bow (fallback) | `src/models/createToyBow.js` |
| Blender bow (primary) | `assets/models/bow-blender.glb` **v3** (`make_bow_v3_and_export.py`) |
| Hand equip | Prefers Blender GLB; debug `getBowSource()` / `getBowVersion()` / `getBowSockets()` |
| Offline A/B helper | `src/models/bowCompare.js` (not loaded in `main.js` after 2026-07-18) |
| Carry pose knobs | `BOW_CARRY` in `src/player.js` (locked trial B) + `__letterPathDebug.setBowCarry` |
| Carry pose refs (Imagine) | `assets/generated/bow/archer-back-carry-*.jpg` |
| Verify shot | `docs/verify/bow-trial-B.png` (readable C-curve from follow cam) |
| Process | [visual-pose-tuning.md](../../docs/game-design/visual-pose-tuning.md) (final) |

## Animal goal pictures (Imagine)

| File | Word | Notes |
|------|------|--------|
| `assets/animals/cat.jpg` | CAT | Imagine, 1024² |
| `assets/animals/dog.jpg` | DOG | Imagine |
| `assets/animals/pig.jpg` | PIG | Imagine |
| `assets/animals/hen.jpg` | HEN | Imagine |
| `assets/animals/cow.jpg` | COW | Imagine |
| `assets/animals/bug.jpg` | BUG | Imagine (caterpillar) |
| `assets/animals/fox.jpg` | FOX | Imagine |
| `assets/animals/bat.jpg` | BAT | Imagine |

- **Runtime stills:** `THREE.TextureLoader` loads JPG onto goal plane.  
- **Runtime video:** `THREE.VideoTexture` + looping muted MP4 under `assets/animals/video/{word}.mp4` (Imagine image→video). Prefer video, fall back to JPG, then canvas art.  
- **No word text on billboard** (spelling is the challenge).  
- **Fallback:** `animalArt.js` canvas drawing if media missing.  
- **License:** re-check commercial AI license at ship time (workspace policy).  

### Videos (idle loops)

| File | Word |
|------|------|
| `assets/animals/video/cat.mp4` | CAT |
| `assets/animals/video/dog.mp4` | DOG |
| `assets/animals/video/pig.mp4` | PIG |
| `assets/animals/video/hen.mp4` | HEN |
| `assets/animals/video/cow.mp4` | COW |
| `assets/animals/video/bug.mp4` | BUG |
| `assets/animals/video/fox.mp4` | FOX |
| `assets/animals/video/bat.mp4` | BAT |

## Geometry / conventions

| Asset | Size / notes | Source |
|-------|----------------|--------|
| Goal sign plane | `GOAL_BILLBOARD.size` (~7.5u) at path end | `constants.js` |
| Letter markers | 0.8×1.6 boxes + canvas letters | procedural |

## Folders

| Path | Role |
|------|------|
| `assets/animals/` | Game-ready Imagine portraits |
| `assets/generated/` | Imagine / edits archive |
| `src/models/` | Procedural factories (img2threejs path) |
| `tools/img2threejs/` | Skill smoke work + bow preview |
| `tools/blender-mcp/` | Blender MCP setup notes + addon copy |
| Workspace `Games/Assets/` | Shared zips only |

## SFX

- Mute early; WebAudio + speechSynthesis (R-4)  
