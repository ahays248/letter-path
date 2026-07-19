# Lessons learned — Letter Path

**Load rule:** Open **only** the section for this session’s work (see workspace [session-load-map.md](../../docs/game-design/session-load-map.md)). Do not preload every row.

Append same day as the pain. One row per trap.

---

## § gameplay

| Date | Trap | Rule |
|------|------|------|
| 2026-07-19 | Fat top-left HUD + status lines kids never read; blocks animal on mobile | Thin center-top strip; parent gear menu; toast only for big moments; middle reserved for path |
| 2026-07-19 | Letter VO on gate-commit is silent on mobile (no user gesture) | Speak letter on L/R *tap*; TTS letter *names* ("see") not single chars |
| 2026-07-19 | Dummy speak()+cancel "unlock" poisons iOS speechSynthesis | Unlock = AudioContext only; never prime TTS with cancel |
| 2026-07-19 | DuckDuckGo iOS: speechSynthesis silent; aggressive TTS hacks can kill chimes too | Letter VO = pre-recorded MP3; decode to WebAudio buffers after Go unlock; keep input handlers simple |
| 2026-07-19 | VO on L/R *choose* skips same-lane letters and feels early | Speak letter on **gate commit** (correct/complete), not on steer |
| 2026-07-19 | Last letter: letter MP3 + toast `speechSynthesis` = two competing voices | One voice path only; toast default silent; complete sting after short delay |
| 2026-07-19 | Accidental **L** key toggled name↔sound mid-run | Letter mode = gear UI only; no single-letter hotkey |
| 2026-07-19 | Desktop follow-cam on phone portrait = unplayably zoomed | Pull back/lift by `cameraPull()`; wider FOV when height > width |
| 2026-07-19 | gTTS bare `"ay"` for A name sounded like phoneme / short-a | Name prompts must be distinct; A name = “ay as in day” until real VO; cache-bust `?v=` on clip URLs |
| 2026-07-19 | Touch buttons need `pointerdown` + `touch-action: manipulation` | Prefer pointer events over click-only; big hit targets; prevent double-fire |
| 2026-07-17 | Auto-commit center-as-wrong at tight Z → late picks full-reset | Score in generous pick zone; auto-fail only past fail line with no pick; never `resetRun` on correct |
| 2026-07-17 | Single moving fork felt discontinuous | Lay all letter forks on path; highlight active |
| 2026-07-17 | `armFork` forced CENTER same frame as correct → no L/R snap | Keep chosen lane after correct; center only on word reset |
| 2026-07-17 | Resolve-on-keypress scored before markers | Steer anytime; score when Z crosses fork using visual lane |
| 2026-07-17 | Video-on-load / huge videos lag | Still-first; celebrate video after correct word; lite loops |

---

## § assets

| Date | Trap | Rule |
|------|------|------|
| 2026-07-18 | Pure bpy primitive bow lost to code factory | SOURCE deliberately; no pure-cylinder “final”; see asset-generation-process |
| 2026-07-18 | Viral Blender MCP demos ≠ primitive stacking skill | Often AI mesh import + MCP cleanup |
| 2026-07-18 | Joined whole bow for clean GLB | Keep hierarchy + sockets if shoot/walk planned |
| 2026-07-18 | Pose via scattered eulers, no screenshot | One knobs object + game-cam screenshot loop (`visual-pose-tuning`) |
| 2026-07-18 | “On back” without wear ref; edge-on stick from follow cam | Imagine carry ref → batch trials from **real camera** → lock winner (trial B: `rot.y=π` so C faces cam) |
| 2026-07-18 | Rest string was drawn/slack V | Rest = **taut** tip-to-tip; draw pulls nock later (`loadBowGlb` taut replace) |

**Depth (open only if needed):** `asset-generation-process` · `visual-pose-tuning` · `low-poly-assets-and-animation` · project `ASSETS.md`

---

## § product / playtest

| Date | Trap | Rule |
|------|------|------|
| 2026-07-19 | Static ES modules on GitHub Pages need `.nojekyll` + source branch | Deploy playable-only tree; wait for Pages `building` → 200 before sharing |
| 2026-07-18 | Kid wants dog | Keep path loop; dog = **R-11 reward hub**, not letter gates |
