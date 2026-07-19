# Session history — Letter Path

## 2026-07-19 — R-7 touch + R-6b dialogue + R-9 deploy

- **R-7:** `#btn-left` / `#btn-right` + canvas swipe; HUD **Letter: name/sound** toggle; mute + mode in `localStorage`  
- **R-6b:** `src/dialogue.js` confirmation lines; phoneme map for letter **sound** mode; slightly richer chimes  
- **R-9:** `scripts/deploy-github-pages.sh` → public repo `ahays248/letter-path` + Pages  
  - Live: https://ahays248.github.io/letter-path/  
  - Notes: `docs/DEPLOY.md`  
- **R-11/R-12:** design parking only (`docs/superpowers/specs/2026-07-19-r11-r12-design-notes.md`); no hub/shoot code  
- Next: **R-8** playtest on phone with family URL  

## 2026-07-19 — Audio bugs + local VO research park

- Last letter: two voices (letter clip + toast TTS) → toast **speak off**; sting delayed after letter  
- Accidental name→sound: removed **L** hotkey; gear-only toggle  
- ElevenLabs Creator likely no API → park research for **open SFX+TTS on GB10**: `docs/game-design/research-todo-local-sfx-tts-2026.md`; LetterPath **R-6e**; workspace W-3 note  
- Word-complete spoken line = research later (visual toast only for now)  

## 2026-07-19 — HUD / toast layout (R-6b revise)

- Kid focus: removed fat top-left status card; per-letter text dropped  
- Thin **center-top** stars + progress strip; soft scrim (not a big panel over the animal)  
- Parent mute / letter mode behind **gear** top-right  
- Bottom **toast** only for word complete / set complete  
- Mobile: Go card bottom-center; lane buttons dimmed on ready  
- Redeploy Pages after change for family URL

## 2026-07-18 — Session close

- Removed in-game bow **comparison pedestals** (`addBowCompare`); A/B finished, v3 kept on hand  
- Session wrap docs: HANDOFF / STATUS / ROADMAP / this log  
- Next session: pick **R-7**, **R-6b**, or **R-9** (not dog/shoot without design)  
- Asset decision tree remains in workspace AGENTS for all future art  
- Bow back-carry: Imagine archer refs + trial batch from follow cam → **locked trial B** (`BOW_CARRY`); taut rest string (v4 load)  
- Doc load **token budget**: `session-load-map.md` + LESSONS by **§** (gameplay/assets/product); don’t preload asset pipeline in non-art sessions  



## 2026-07-18 — Playtest-1 keep + Blender MCP setup

- Morning playtest with son: **likes the game → keep** core loop  
- Only request: **dog** in the game (companion / pet)  
- Direction: later **reward hub** (ABC Mouse–style interactable rewards earned by learning); dog is one reward  
- Logged PT-1 in PLAYTESTS; ROADMAP Playtest-1 done; R-11 parked for dog/hub  
- Installed **Blender 5.2** (winget); enabled **blender_mcp** addon (bind patched to `0.0.0.0` for WSL)  
- Grok MCP `blender` in `~/.grok/config.toml`; smoke test: WSL → Windows host:9876 scene info **success**  
- Dog/reward hub parked as **R-11**; active art path **R-6c**  
- Installed **img2threejs** skill (`~/.grok/skills/img2threejs`); documented dual path in `docs/game-design/art-toolbelt-3d.md`  
- Bow smoke: Imagine ref → pipeline scripts → game factory `src/models/createToyBow.js` + `tools/img2threejs/preview.html`; wired into unlock bow  
- Blender MCP: built toy bow + exported `assets/models/bow-blender.glb`; `GLTFLoader` + in-game pedestals (code vs blender); hand prefers GLB (`getBowSource() === blender-glb`)  
- Aaron: **code (img2) looked better** on first pass; researched Blender MCP / agent asset news → `docs/game-design/blender-mcp-research-2026-07.md`  
- Recorded **asset-generation-process.md** (cross-game) + LESSONS + toolbelt links  
- Blender **bow v2**: `make_bow_v2_and_export.py` (curve limb, Principled mats, .blend recovery) → overwrote `bow-blender.glb` (~330KB); v1 kept; in-game pedestals + hand load verified (`blender-glb`)  
- Hyper3D free-trial flag enabled in session (optional future SOURCE); v2 still scripted hard-surface with stages  
- Aaron: v2 is big improvement; research **how low-poly games build props** + prep for **bow shoot** and **dog walk** → `docs/game-design/low-poly-assets-and-animation.md`; ROADMAP R-6d / R-12 / R-11b  
- Wired asset decision tree into workspace **AGENTS.md**, LetterPath **AGENTS.md**, Claude.md, `.grok/rules/game-design.md`  
- **R-6d Bow v3:** modular export (`Limb`/`Grip`/`String`/`Arrow`/`socket_hand`/`socket_nock`); loader exposes sockets; in-game verify `ver:3` + sockets true  








## 2026-07-17 — Session wrap (ready for playtest)

- Ready Go card moved bottom-left so letter options stay visible  
- Env polish: grass texture, sun, clouds, ground full path length, post behind billboard  
- Higher ready camera  
- Core game ready to show son tomorrow  
- Polish backlog: character, bow, asset pipeline, letter SFX, confirmation dialogue  
- Next session: Playtest-1  

## 2026-07-17 — R-6 bow unlock

- First full set clear unlocks bow (localStorage); equip on character; modal + HUD badge  
- Future polish logged: letter SFX quality + confirmation dialogue research  

## 2026-07-17 — R-5.1 polish

- Go button; still then celebrate video; gates fit road  

## 2026-07-17 — R-5 animal set + stars

- 8 animals; stars HUD; set complete loop  
- Wrong = current word only  


## 2026-07-17 — R-4 juice + continuous fix

- Aaron: path still reset after each letter  
- Cause: auto-commit center-as-wrong when pick was late at markers  
- Fix: all forks on path; resolve on keypress in pick zone; Z never resets on correct  
- Juice: `audio.js` chime / wrong / complete / letter-name VO; Mute + M  
- Playwright continuous true through CAT  
- Next: R-5 animal set + stars  

## 2026-07-17 — R-3 continuous path + cat picture

- Aaron: do **not** reset path between letters; walk until word is spelled  
- Multi-fork constants; `armNextCommit`; movable letter markers; canvas cat goal  
- Continuous resolve: correct keeps Z; wrong full reset; complete success + pulse  
- Playwright: continuous true; C A T complete; wrong oops  
- Next: R-4 juice  

## 2026-07-17 — R-2 spelling core

- Plan: `docs/superpowers/plans/2026-07-17-letter-path-r2-spelling-core.md`  
- `spelling.js` CAT state; path letter CanvasTextures; HUD strip + oops/complete messages  
- Wire: commit resolves correct/wrong; reset player between letters; complete hold then restart  
- Verified: Playwright `C _ _` / `C A _` / full complete cycle; wrong → oops; server 8080  
- Next: R-3 picture at path end  

## 2026-07-17 — R-1 path greybox

- Auto-walk, L/R lanes, camera follow; L/R anytime before commit (timing fix)  

## 2026-07-17 — Design + scaffold

- Ran `/new-game` + brainstorming (text-only)  
- Audience: kids/family ~6; commercial long-term; micro sessions  
- Path-first spelling runner; next-letter L/R; picture at path end; progress strip; word reset on fail  
- Animal CVC set + stars + one bow unlock for v0  
- Three.js 3D low-poly; free web until learning + return, then itch  
- Spec approved: `docs/superpowers/specs/2026-07-17-letter-path-design.md`  
- Scaffolded project docs, assets/, src/, local git  
- Wrote R-0 plan; active chunk = R-0  

## 2026-07-17 — R-0 shell done

- Implemented runnable Three.js shell: `index.html`, `style.css`, `src/main.js`, `src/scene.js`  
- Import map → Three.js 0.170.0 from jsDelivr; ES module boot + rAF loop  
- Scene: sky-blue clear, green ground plane, orange box marker, ambient + directional light, resize  
- HUD: “Letter Path — R-0 shell”  
- Verified via `python3 -m http.server 8080`: local assets HTTP 200; Three CDN 200; `node --check` clean  
- No spelling gameplay (by design)  
- Active chunk → **R-1** path greybox  

## 2026-07-17 — R-1 path greybox done

- Path greybox: auto-walk, L/R lane choice at fork, camera follow  
- Modules live: `constants.js`, `path.js`, `player.js`, `input.js` (plus main/scene wiring)  
- HUD: “Letter Path — R-1 path | lane: … | choose L/R | ←/→ or A/D”  
- Verified: server 8080 HTTP 200 on index, style, main, scene, path, player, input, constants  
- Playwright/Chromium screenshots: start, approach fork, after ArrowLeft; title Letter Path; HUD has R-1; no pageerror (favicon 404 ignored)  
- Docs closeout: ROADMAP R-1 done / R-2 next  
- Active chunk → **R-2** spelling core (CAT, decoy, progress strip, fail reset)  
