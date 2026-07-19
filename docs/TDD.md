# Tech design lite — Letter Path

**Status:** stack locked for v0  
**Last updated:** 2026-07-19  

## Stack

| Layer | Choice |
|-------|--------|
| Runtime | Browser (desktop + touch) |
| 3D | **Three.js** (ES modules; CDN importmap) |
| Language | JavaScript (ES modules) |
| Build | None (static files + local server or GitHub Pages) |
| Persist | `localStorage`: bow unlock, mute, letter name/sound mode |
| Deploy | Public Pages: `ahays248/letter-path` → https://ahays248.github.io/letter-path/ |

## Architecture (target)

| Module | Responsibility |
|--------|----------------|
| `src/main.js` | Boot, rAF loop, wire systems |
| `src/scene.js` | Three.js scene, camera, lights, renderer resize |
| `src/path.js` | Path geometry, lanes, fork positions (R-1+) |
| `src/player.js` | Auto-walk along path (R-1+) |
| `src/input.js` | Keyboard + on-screen L/R + swipe (R-7) |
| `src/spelling.js` | Word state, decoys, progress strip model (R-2+) |
| `src/dialogue.js` | Short confirmation lines (R-6b) |
| `src/audio.js` | Chimes, letter name/sound VO, mute (R-4 / R-6b / R-7) |
| `src/words.js` | Animal CVC bank (R-5) |
| `src/progress.js` | Stars, set complete, bow unlock (R-5/R-6) |

**R-5 live (2026-07-17):** `words.js`, `set.js`; multi-word progression + stars; `path.setGoalPicture`.  
**R-4 live:** `audio.js`; commit-on-pass; continuous multi-fork.  
**R-2/R-3:** spelling + path layout.  
Debug: `getWord`, `getStars`, `getStarsDisplay`.

## Constraints

- Readable letters in 3D (billboards or large meshes)  
- No bundler required until complexity forces it  
- No remote git unless Aaron asks  

## Non-goals (tech)

- Native mobile wrappers for v0  
- Godot/Unity for this product path  
- Multiplayer  
