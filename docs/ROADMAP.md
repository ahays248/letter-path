# ROADMAP — Letter Path

Dependencies flow top → bottom. Implement **one chunk** at a time.

| Id | Outcome | Depends | Status |
|----|---------|---------|--------|
| **R-0** | Runnable Three.js shell (page + scene + camera) | Design approved | **done** |
| **R-1** | Greybox path: auto-walk, L/R lanes, fork timing | R-0 | **done** |
| **R-2** | Spelling core: CAT, decoy, progress strip, fail→reset word | R-1 | **done** |
| **R-3** | Continuous multi-fork path + picture at end + success feedback | R-2 | **done** |
| **R-4** | Juice + continuous pick fix (chime, letter VO, mute; resolve-on-keypress) | R-3 | **done** |
| **R-5** | Full animal set (~8–10) + stars + set complete | R-4 | **done** |
| **R-6** | One unlock (bow) after set | R-5 | **done** |
| **Playtest-1** | First playtest with son → PLAYTESTS notes | R-6 | **done (keep)** |
| **R-6b** | Polish: letter SFX + confirmation dialogue | after playtest | **done** |
| **R-6c** | Character + bow art + Blender→glTF→Three.js (+ MCP) | after playtest | **done** (baseline) |
| **R-6d** | Bow v3 modular hierarchy + sockets | R-6c | **done** |
| **R-7** | Parent name/sound toggle + on-screen buttons + basic touch | R-4+ | **done** |
| **R-8** | Follow-up structured playtests (prefer live URL + phone) | R-6 keep | **next** |
| **R-9** | Free web deploy for family share | R-7 or after polish | **done** (Pages) |
| **R-11** | Reward hub + pet dog (ABC Mouse–like interactable rewards) | design pass | later — notes in `specs/2026-07-19-r11-r12-design-notes.md` |
| **R-12** | Unlock bow **shoot** toy mode (draw/release/arrow juice) — not mid-spelling combat | R-6d hierarchy; design so path loop stays primary | later — same design notes |
| **R-11b** | Dog **walk / wander** in reward hub (simple cycle or light rig) | R-11 design | later |
| **R-10+** | More sets, blending research, richer meta, itch | After evidence | later |
| **R-6e** | Better letter + celebration VO (local GB10 open models; not ElevenLabs API) | research first | later — [research-todo-local-sfx-tts-2026.md](../../docs/game-design/research-todo-local-sfx-tts-2026.md) |

## Notes

- Fun risks first: R-1 fork readability, R-2 letter correctness + kind reset.  
- **PT-1 keep:** do not redesign path loop; dog belongs in **R-11 reward hub**, not letter gates.  
- Asset pipeline baseline is in place (process docs + bow v3).  
- **2026-07-19:** R-7 / R-6b / R-9 done. Prefer **R-8 playtest** on https://ahays248.github.io/letter-path/ before R-11/R-12 code.  
- Pedestal A/B removed after v3 accepted (2026-07-18 session close).  
- **VO:** interim gTTS MP3s; Creator ElevenLabs likely UI-only. Next quality step = GB10 open-model research (R-6e / workspace W-3). Celebration spoken line deliberately off until then.
