# Letter Path SFX

## Letters (`letters/`)

Pre-recorded MP3s for letter **name** and **sound** modes.

| File pattern | Example | Use |
|--------------|---------|-----|
| `{L}_name.mp3` | `C_name.mp3` | Parent mode “Letter: name” (says “see”) |
| `{L}_sound.mp3` | `C_sound.mp3` | Parent mode “Letter: sound” (says “kuh”) |

**Why files, not browser TTS:** DuckDuckGo and other iOS browsers often mute or break `speechSynthesis`. HTMLAudio clips play from a tap.

**Source:** interim gTTS (Google TTS) for family/dev.  
**Upgrade path:** local open TTS on GB10 when researched — see `docs/game-design/research-todo-local-sfx-tts-2026.md` (ElevenLabs Creator plan likely has no API access).  
Re-check license before commercial store ship.

**Letters covered:** A B C D E F G H I N O P T U W X (animal set)

**Name vs sound (important):**  
- `*_name.mp3` = alphabet name (A ≈ “ay”, not short‑a)  
- `*_sound.mp3` = phoneme (A ≈ “aah”)  
gTTS often mangles bare `"ay"` into something that sounds like the phoneme — A name clip uses a clearer phrase (“ay as in day”) until GB10 VO replaces these.
