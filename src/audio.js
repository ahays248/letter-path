/**
 * R-4 + R-6b juice audio: chimes + letter name/sound VO + mute.
 *
 * Letter VO uses **pre-recorded MP3s** decoded into Web Audio buffers when possible
 * (plays at gate *commit*, including same-lane letters; works after Go! unlock on mobile).
 * HTMLAudio is a fallback. speechSynthesis is last resort (desktop only).
 *
 * DuckDuckGo / iOS: unlock WebAudio on Go! and L/R taps; do not rely on speechSynthesis.
 */

const STORAGE_MUTE = "letterPath.muted";
const STORAGE_MODE = "letterPath.letterMode";

/** Letters we ship audio for (animal CVC set) */
const LETTER_FILES = "ABCDEFGHINOPTUWX".split("");

const LETTER_BASE = "assets/sfx/letters";
/** Bump when letter clips change so browsers/Pages CDN do not keep old A_name etc. */
const LETTER_CLIP_VER = "2";

/** Fallback TTS only; primary VO is MP3. Keep name phrases distinct from phonemes. */
const LETTER_NAMES = {
  A: "ay",
  B: "bee",
  C: "see",
  D: "dee",
  E: "ee",
  F: "eff",
  G: "jee",
  H: "aych",
  I: "eye",
  N: "en",
  O: "oh",
  P: "pee",
  T: "tee",
  U: "you",
  W: "double you",
  X: "ex",
};

const LETTER_SOUNDS = {
  A: "aah",
  B: "buh",
  C: "kuh",
  D: "duh",
  E: "eh",
  F: "fff",
  G: "guh",
  H: "huh",
  I: "ih",
  N: "nnn",
  O: "oh",
  P: "puh",
  T: "tuh",
  U: "uh",
  W: "wuh",
  X: "ks",
};

function readStored(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode / blocked storage
  }
}

export function createAudio() {
  let muted = readStored(STORAGE_MUTE, "0") === "1";
  /** @type {"name" | "sound"} */
  // Only "sound" opts into phoneme mode; anything else (null, typo) = name
  let letterMode = readStored(STORAGE_MODE, "name") === "sound" ? "sound" : "name";
  // Normalize storage so a bad value cannot flip mid-session later
  writeStored(STORAGE_MODE, letterMode);
  /** @type {AudioContext | null} */
  let ctx = null;
  /** @type {Map<string, AudioBuffer>} */
  const bufferCache = new Map();
  /** @type {Map<string, HTMLAudioElement>} */
  const htmlCache = new Map();
  /** @type {AudioBufferSourceNode | null} */
  let activeSource = null;
  /** @type {HTMLAudioElement | null} */
  let activeHtml = null;
  let preloadStarted = false;

  function clipKey(letter, mode) {
    return `${String(letter).toUpperCase()}_${mode}`;
  }

  function clipUrl(letter, mode) {
    return `${LETTER_BASE}/${String(letter).toUpperCase()}_${mode}.mp3?v=${LETTER_CLIP_VER}`;
  }

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        try {
          ctx = new AC();
        } catch {
          ctx = null;
        }
      }
    }
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  /**
   * Decode all letter MP3s into AudioBuffers (after unlock).
   * Then speakLetter can play mid-run without a fresh user gesture.
   */
  async function preloadLetters() {
    if (preloadStarted) return;
    preloadStarted = true;
    const ac = ensureCtx();
    if (!ac) return;

    const modes = ["name", "sound"];
    for (const L of LETTER_FILES) {
      for (const mode of modes) {
        const key = clipKey(L, mode);
        if (bufferCache.has(key)) continue;
        try {
          const res = await fetch(clipUrl(L, mode));
          if (!res.ok) continue;
          const arr = await res.arrayBuffer();
          const buf = await ac.decodeAudioData(arr.slice(0));
          bufferCache.set(key, buf);
        } catch {
          // keep HTML fallback path
        }
      }
    }
  }

  /**
   * Call from every user tap (Go!, L/R). Unlocks Web Audio for chimes + letter buffers.
   */
  function unlock() {
    const ac = ensureCtx();
    if (ac) {
      try {
        const buf = ac.createBuffer(1, 1, ac.sampleRate || 22050);
        const src = ac.createBufferSource();
        src.buffer = buf;
        src.connect(ac.destination);
        src.start(0);
      } catch {
        // ignore
      }
      ac.resume().catch(() => {});
    }
    // Fire-and-forget buffer load
    preloadLetters().catch(() => {});
  }

  function beep({ freq = 880, duration = 0.12, type = "sine", gain = 0.08, delay = 0 }) {
    if (muted) return;
    const ac = ensureCtx();
    if (!ac) return;
    try {
      const t0 = ac.currentTime + delay;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
      g.gain.linearRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.03);
    } catch {
      // ignore
    }
  }

  function playCorrect() {
    beep({ freq: 660, duration: 0.09, gain: 0.09 });
    beep({ freq: 990, duration: 0.14, gain: 0.1, delay: 0.07 });
  }

  function playWrong() {
    beep({ freq: 200, duration: 0.1, type: "triangle", gain: 0.07 });
    beep({ freq: 150, duration: 0.16, type: "triangle", gain: 0.06, delay: 0.08 });
  }

  function playComplete() {
    beep({ freq: 523, duration: 0.1, gain: 0.09 });
    beep({ freq: 659, duration: 0.1, gain: 0.09, delay: 0.09 });
    beep({ freq: 784, duration: 0.18, gain: 0.11, delay: 0.18 });
  }

  function playUiTap() {
    beep({ freq: 520, duration: 0.05, type: "sine", gain: 0.05 });
  }

  function stopLetter() {
    if (activeSource) {
      try {
        activeSource.stop();
      } catch {
        // ignore
      }
      activeSource = null;
    }
    if (activeHtml) {
      try {
        activeHtml.pause();
        activeHtml.currentTime = 0;
      } catch {
        // ignore
      }
      activeHtml = null;
    }
  }

  function playBuffer(key) {
    const ac = ensureCtx();
    const buf = bufferCache.get(key);
    if (!ac || !buf) return false;
    try {
      stopLetter();
      const src = ac.createBufferSource();
      const g = ac.createGain();
      g.gain.value = 1;
      src.buffer = buf;
      src.connect(g);
      g.connect(ac.destination);
      src.start(0);
      activeSource = src;
      src.onended = () => {
        if (activeSource === src) activeSource = null;
      };
      return true;
    } catch {
      return false;
    }
  }

  function playHtml(letter, mode) {
    const L = String(letter).toUpperCase().slice(0, 1);
    const key = clipKey(L, mode);
    let el = htmlCache.get(key);
    if (!el) {
      el = new Audio(clipUrl(L, mode));
      el.preload = "auto";
      el.setAttribute("playsinline", "true");
      el.volume = 1;
      htmlCache.set(key, el);
    }
    try {
      stopLetter();
      el.currentTime = 0;
      activeHtml = el;
      const p = el.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => speakTextFallback(L));
      }
      return true;
    } catch {
      return false;
    }
  }

  function speakTextFallback(letter) {
    if (muted || !window.speechSynthesis) return;
    const L = String(letter || "").toUpperCase().slice(0, 1);
    const text =
      letterMode === "sound"
        ? LETTER_SOUNDS[L] || LETTER_NAMES[L] || L.toLowerCase()
        : LETTER_NAMES[L] || L.toLowerCase();
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.95;
      u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch {
      // ignore
    }
  }

  /**
   * Letter feedback at gate commit (correct letter locked).
   * Prefers Web Audio buffer (works after unlock without a fresh tap).
   * @param {string} letter
   */
  function speakLetter(letter) {
    if (muted) return;
    const L = String(letter || "").toUpperCase().slice(0, 1);
    if (!L || L === "?") return;
    const mode = letterMode === "sound" ? "sound" : "name";
    const key = clipKey(L, mode);

    if (playBuffer(key)) return;

    // Buffer not ready yet — try HTML, then TTS
    if (playHtml(L, mode)) {
      // Also kick decode for next time
      preloadLetters().catch(() => {});
      return;
    }
    speakTextFallback(L);
  }

  function speakText(text) {
    if (muted || !window.speechSynthesis) return;
    const str = String(text || "").trim();
    if (!str) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(str);
      u.lang = "en-US";
      u.rate = 0.95;
      u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch {
      // ignore
    }
  }

  function setMuted(next) {
    muted = Boolean(next);
    writeStored(STORAGE_MUTE, muted ? "1" : "0");
    if (muted) {
      stopLetter();
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    }
    return muted;
  }

  function toggleMute() {
    return setMuted(!muted);
  }

  function isMuted() {
    return muted;
  }

  /**
   * @param {"name" | "sound"} mode
   */
  function setLetterMode(mode) {
    letterMode = mode === "sound" ? "sound" : "name";
    writeStored(STORAGE_MODE, letterMode);
    return letterMode;
  }

  function toggleLetterMode() {
    return setLetterMode(letterMode === "name" ? "sound" : "name");
  }

  function getLetterMode() {
    return letterMode;
  }

  return {
    playCorrect,
    playWrong,
    playComplete,
    playUiTap,
    speakLetter,
    speakText,
    setMuted,
    toggleMute,
    isMuted,
    setLetterMode,
    toggleLetterMode,
    getLetterMode,
    unlock,
    preloadLetters,
  };
}
