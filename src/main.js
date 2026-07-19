import { createScene } from "./scene.js";
import { createPath } from "./path.js";
import { createPlayer } from "./player.js";
import { createInput } from "./input.js";
import { createSpelling } from "./spelling.js";
import { createAudio } from "./audio.js";
import { createWordSet } from "./set.js";
import { ANIMAL_SET } from "./words.js";
import { createUnlocks } from "./unlocks.js";
import { wordCompleteLine, setCompleteLine } from "./dialogue.js";
import { PATH, secondsBetweenLetters, activeDifficultyId } from "./constants.js";

const canvas = document.getElementById("game-canvas");
const hud = document.getElementById("hud");
const progressEl = document.getElementById("progress-strip");
const toastEl = document.getElementById("toast");
const starsEl = document.getElementById("stars");
const unlockBadge = document.getElementById("unlock-badge");
const parentMenuBtn = document.getElementById("parent-menu-btn");
const parentPanel = document.getElementById("parent-panel");
const muteBtn = document.getElementById("mute-btn");
const letterModeBtn = document.getElementById("letter-mode-btn");
const leftBtn = document.getElementById("btn-left");
const rightBtn = document.getElementById("btn-right");
const startOverlay = document.getElementById("start-overlay");
const startBtn = document.getElementById("start-btn");
const unlockOverlay = document.getElementById("unlock-overlay");
const unlockOkBtn = document.getElementById("unlock-ok-btn");
if (!canvas) {
  throw new Error("Missing #game-canvas");
}

/** @type {ReturnType<typeof setTimeout> | null} */
let toastTimer = null;

function setPhaseClass(next) {
  document.body.classList.remove(
    "phase-ready",
    "phase-walking",
    "phase-celebrate",
    "phase-setComplete",
    "phase-unlockModal"
  );
  document.body.classList.add(`phase-${next}`);
}

/**
 * Big-moment toast only (word / set complete). Not used per letter.
 * @param {string} text
 * @param {{ setComplete?: boolean, holdMs?: number, speak?: boolean }} [opts]
 */
function showToast(text, opts = {}) {
  if (!toastEl) return;
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
  toastEl.textContent = text;
  toastEl.classList.toggle("set-complete", Boolean(opts.setComplete));
  toastEl.classList.remove("hidden", "fade-out");
  // Force reflow so fade-in works if we re-show quickly
  void toastEl.offsetWidth;
  toastEl.classList.add("show");
  // Default OFF: toast TTS competed with letter MP3 (two voices). Opt-in only.
  if (opts.speak === true) {
    audio.speakText(text);
  }
  // Hold through most of the celebrate video window
  const hold = opts.holdMs ?? 3200;
  toastTimer = setTimeout(() => {
    toastEl.classList.add("fade-out");
    toastEl.classList.remove("show");
    toastTimer = setTimeout(() => {
      toastEl.classList.add("hidden");
      toastEl.classList.remove("fade-out");
      toastTimer = null;
    }, 320);
  }, hold);
}

function hideToast() {
  if (!toastEl) return;
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
  toastEl.textContent = "";
  toastEl.classList.add("hidden");
  toastEl.classList.remove("fade-out", "set-complete", "show");
}

function setParentPanelOpen(open) {
  if (!parentPanel || !parentMenuBtn) return;
  parentPanel.classList.toggle("hidden", !open);
  parentMenuBtn.setAttribute("aria-expanded", open ? "true" : "false");
}

const world = createScene(canvas);
const path = createPath(world.scene);
const player = createPlayer(world.scene);
const wordSet = createWordSet(ANIMAL_SET);
const unlocks = createUnlocks();
const first = wordSet.current();
const spelling = createSpelling(first.word);
const audio = createAudio();

// Equip bow if already unlocked from a prior session
player.setBowEquipped(unlocks.hasBow());
// When GLB finishes loading onto hand, keep equip state
player.bowReady?.then(() => {
  player.setBowEquipped(unlocks.hasBow());
});

/**
 * ready — look at animal, hit Go (no auto-walk)
 * walking — spelling run
 * celebrate — word done; still→video reward, then next ready
 * setComplete — whole set done (timer then unlock modal or restart)
 * unlockModal — bow unlock overlay
 */
/** @type {"ready" | "walking" | "celebrate" | "setComplete" | "unlockModal"} */
let phase = "ready";
/** @type {{ word: string, color?: string, image?: string, video?: string } | null} */
let pendingNext = null;
/** Animal that was just spelled (for video reward) */
let celebrateEntry = null;
let completeHold = 0;

function showStartOverlay(show) {
  if (!startOverlay) return;
  startOverlay.classList.toggle("hidden", !show);
}

function layoutWordOnPath() {
  const entry = wordSet.current();
  if (!entry) return;
  path.layoutForks(spelling.getForks());
  path.setActiveFork(spelling.getIndex());
  player.armFork(spelling.getIndex());
}

/**
 * Prepare a word with STILL image only; wait for Go before walking.
 */
function beginWordReady(entry) {
  if (!entry) return;
  phase = "ready";
  setPhaseClass(phase);
  pendingNext = null;
  celebrateEntry = null;
  completeHold = 0;
  hideToast();
  setParentPanelOpen(false);
  spelling.loadWord(entry.word);
  player.resetRun();
  path.pulseGoal(false);
  path.setGoalPicture(entry); // still only
  layoutWordOnPath();
  showStartOverlay(true);
  updateHud();
}

function startWalking() {
  if (phase !== "ready") return;
  phase = "walking";
  setPhaseClass(phase);
  showStartOverlay(false);
  hideToast();
  setParentPanelOpen(false);
  // Unlock WebAudio + letter MP3s inside the Go! tap (required on iOS/DDG)
  audio.unlock();
  audio.preloadLetters?.();
  document.querySelectorAll("video").forEach((v) => v.play().catch(() => {}));
  updateHud();
  canvas.focus();
}

function updateHud() {
  if (hud) {
    const wNum =
      phase === "celebrate" || phase === "setComplete"
        ? Math.max(1, wordSet.stars())
        : Math.min(wordSet.getIndex() + 1, wordSet.total());
    hud.textContent = `Animal ${wNum}/${wordSet.total()}`;
  }
  if (progressEl) {
    progressEl.textContent = spelling.getProgressDisplay();
  }
  if (starsEl) {
    starsEl.textContent = wordSet.starsDisplay();
    starsEl.setAttribute(
      "aria-label",
      `${wordSet.stars()} of ${wordSet.total()} stars`
    );
  }
  if (muteBtn) {
    muteBtn.textContent = audio.isMuted() ? "Unmute" : "Mute";
    muteBtn.setAttribute("aria-pressed", audio.isMuted() ? "true" : "false");
  }
  if (letterModeBtn) {
    const mode = audio.getLetterMode();
    letterModeBtn.textContent =
      mode === "sound" ? "Letter: sound" : "Letter: name";
    letterModeBtn.setAttribute("aria-pressed", mode === "sound" ? "true" : "false");
  }
  if (unlockBadge) {
    unlockBadge.classList.toggle("hidden", !unlocks.hasBow());
  }
}

function showUnlockOverlay(show) {
  if (!unlockOverlay) return;
  unlockOverlay.classList.toggle("hidden", !show);
}

function afterCelebrate() {
  if (phase === "setComplete") {
    // First full clear: unlock bow + modal; later clears skip modal
    const newly = unlocks.unlockBow();
    player.setBowEquipped(true);
    updateHud();
    if (newly) {
      showStartOverlay(false);
      showUnlockOverlay(true);
      hideToast();
      // Stay paused until Awesome!; after that restart set
      phase = "unlockModal";
      setPhaseClass(phase);
      return;
    }
    const again = wordSet.restartSet();
    beginWordReady(again);
    return;
  }

  // Next animal: still image + wait for Go again
  phase = "ready";
  if (pendingNext) {
    const next = pendingNext;
    pendingNext = null;
    beginWordReady(next);
  } else {
    const cur = wordSet.current();
    if (cur) beginWordReady(cur);
  }
}

function dismissUnlockAndContinue() {
  showUnlockOverlay(false);
  const again = wordSet.restartSet();
  beginWordReady(again);
}

function resolveLane(lane) {
  if (phase !== "walking") return;
  if (spelling.getStatus() === "complete") return;

  const result = spelling.resolveCommit(lane);
  player.markForkResolved();

  if (result === "wrong") {
    // Feedback: soft oops SFX + word reset (no corner text kids miss)
    audio.playWrong();
    player.resetRun();
    layoutWordOnPath();
    updateHud();
    return;
  }

  if (result === "correct") {
    // VO on *pass-through* so same-lane letters still speak (not only on L/R tap)
    const letter = spelling.getLocked().slice(-1)[0];
    audio.playCorrect();
    audio.speakLetter(letter);
    const next = spelling.getIndex();
    player.armFork(next);
    path.setActiveFork(next);
    updateHud();
    return;
  }

  if (result === "complete") {
    // Last letter: speak the letter, then success sting (no second TTS voice)
    const letter = spelling.getLocked().slice(-1)[0];
    audio.speakLetter(letter);
    // Slight delay so letter clip and complete sting do not fully overlap
    setTimeout(() => {
      if (!audio.isMuted()) audio.playComplete();
    }, 320);
    path.setActiveFork(spelling.getTarget().length);

    // Reward: animate the animal they just spelled
    celebrateEntry = wordSet.current();
    path.playGoalCelebration(celebrateEntry);
    path.pulseGoal(true);

    const { setComplete, next } = wordSet.completeCurrentWord();
    if (setComplete) {
      phase = "setComplete";
      setPhaseClass(phase);
      completeHold = 3.2;
      showToast(
        setCompleteLine({
          stars: wordSet.stars(),
          hasBow: unlocks.hasBow(),
        }),
        { setComplete: true, holdMs: 3400, speak: false }
      );
      updateHud();
      return;
    }

    pendingNext = next;
    phase = "celebrate";
    setPhaseClass(phase);
    completeHold = 2.8; // watch the animal come alive, then next Go
    // Visual toast only for now; spoken word-complete is a research item (GB10 VO)
    showToast(
      wordCompleteLine({
        word: celebrateEntry?.word || spelling.getTarget(),
      }),
      { holdMs: 3200, speak: false }
    );
    updateHud();
  }
}

// Boot: first animal still + Start overlay
beginWordReady(first);

if (startBtn) {
  const go = (e) => {
    e.preventDefault();
    e.stopPropagation();
    startWalking();
  };
  startBtn.addEventListener("pointerup", go);
  startBtn.addEventListener("click", go);
}

if (unlockOkBtn) {
  unlockOkBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dismissUnlockAndContinue();
  });
}

const input = createInput({
  leftBtn,
  rightBtn,
  swipeEl: canvas,
  onChoose(lane) {
    if (phase !== "walking") return;
    // Tap only steers + keeps audio unlocked. Letter VO plays on gate commit
    // so staying in a lane still names each letter you pass.
    audio.unlock();
    audio.playUiTap();
    spelling.clearMessage();
    player.chooseLane(lane);
    updateHud();
  },
});

canvas.addEventListener("click", () => {
  canvas.focus();
  audio.unlock();
  document.querySelectorAll("video").forEach((v) => {
    v.play().catch(() => {});
  });
});

if (parentMenuBtn) {
  parentMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open =
      parentMenuBtn.getAttribute("aria-expanded") !== "true";
    setParentPanelOpen(open);
  });
}

if (muteBtn) {
  muteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    audio.toggleMute();
    updateHud();
  });
}

if (letterModeBtn) {
  // Single handler (click only) so touch does not double-toggle name↔sound
  letterModeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    audio.unlock();
    audio.toggleLetterMode();
    updateHud();
  });
}

// Tap outside parent panel closes it
document.addEventListener("pointerdown", (e) => {
  if (!parentPanel || parentPanel.classList.contains("hidden")) return;
  const t = e.target;
  if (
    t instanceof Node &&
    (parentPanel.contains(t) || parentMenuBtn?.contains(t))
  ) {
    return;
  }
  setParentPanelOpen(false);
});

window.addEventListener("keydown", (e) => {
  if (e.key === "m" || e.key === "M") {
    audio.toggleMute();
    updateHud();
  }
  // Letter name/sound: gear UI only (do not bind L — easy accidental toggle mid-play)
  // Space / Enter can also start
  if (
    (e.key === " " || e.key === "Enter") &&
    phase === "ready" &&
    startOverlay &&
    !startOverlay.classList.contains("hidden")
  ) {
    e.preventDefault();
    startWalking();
  }
});

const clock = { last: performance.now() };

/**
 * Pull back / lift on tall phones. Desktop framing was unplayable in portrait
 * (narrow horizontal FOV + close follow = only feet and one gate).
 */
function cameraPull() {
  const w = window.innerWidth || 1;
  const h = window.innerHeight || 1;
  const portrait = h > w * 1.05;
  if (portrait && w < 480) return 1.75;
  if (portrait) return 1.5;
  if (w < 768) return 1.25;
  return 1;
}

function followCamera() {
  const p = player.getPosition();
  const s = cameraPull();
  if (phase === "ready" || phase === "unlockModal") {
    // Higher + further back: path, gates, and animal while modal is up
    world.camera.position.set(
      p.x * 0.12,
      p.y + 7.8 * s,
      p.z + 12 * s
    );
    world.camera.lookAt(p.x, p.y + 1.2 * s, p.z - 16 * s);
  } else {
    // Walking: keep next gates + both lanes in frame
    world.camera.position.set(
      p.x * 0.22,
      p.y + 5.4 * s,
      p.z + 9 * s
    );
    world.camera.lookAt(p.x, p.y + 0.85 * s, p.z - 10 * s);
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - clock.last) / 1000);
  clock.last = now;

  if (phase === "ready") {
    // Frozen at start so kids can study the picture
    followCamera();
    world.render();
    requestAnimationFrame(frame);
    return;
  }

  if (phase === "unlockModal") {
    followCamera();
    world.render();
    requestAnimationFrame(frame);
    return;
  }

  if (phase === "celebrate" || phase === "setComplete") {
    completeHold -= dt;
    // Freeze character; watch video reward
    if (completeHold <= 0) {
      afterCelebrate();
    }
    followCamera();
    world.render();
    requestAnimationFrame(frame);
    return;
  }

  // walking
  const { finished, justCommitted } = player.update(dt);

  if (justCommitted) {
    resolveLane(player.getLane());
  }

  if (finished && spelling.getStatus() !== "complete" && phase === "walking") {
    player.resetRun();
    layoutWordOnPath();
    updateHud();
  }

  followCamera();
  world.render();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

window.__letterPathDebug = {
  getCorrectLane: () => spelling.getCorrectLane(),
  getProgress: () => spelling.getProgressDisplay(),
  getStatus: () => spelling.getStatus(),
  getMessage: () => spelling.getMessage(),
  getZ: () => player.getPosition().z,
  getX: () => player.getX(),
  getLane: () => player.getLane(),
  getIndex: () => spelling.getIndex(),
  getCommitZ: () => player.getCommitZ(),
  getStartZ: () => PATH.startZ,
  getWord: () => spelling.getTarget(),
  getStars: () => wordSet.stars(),
  getWordIndex: () => wordSet.getIndex(),
  getPhase: () => phase,
  getLaneOffset: () => PATH.laneOffset,
  getGateHalfW: () => PATH.gateHalfW,
  hasBow: () => unlocks.hasBow(),
  getBowSource: () => player.getBowSource(),
  getBowVersion: () => player.getBowVersion(),
  getBowSockets: () => {
    const s = player.getBowSockets();
    if (!s) return null;
    return {
      hand: Boolean(s.hand),
      nock: Boolean(s.nock),
    };
  },
  /** Live back-carry knobs: getBowCarry() / setBowCarry({ pos:{z:-0.55}, size:1.3 }) */
  getBowCarry: () => player.getBowCarry(),
  setBowCarry: (patch) => player.setBowCarry(patch),
  startWalking,
  isMuted: () => audio.isMuted(),
  getLetterMode: () => audio.getLetterMode(),
  setLetterMode: (m) => audio.setLetterMode(m),
};

// Initial HUD (mute / letter mode from localStorage)
setPhaseClass(phase);
updateHud();

console.info(
  `[Letter Path] thin HUD + toast big moments; difficulty=${activeDifficultyId} (~${secondsBetweenLetters().toFixed(1)}s/letter)`
);
