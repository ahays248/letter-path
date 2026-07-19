import { LANE } from "./constants.js";

/**
 * Keyboard + on-screen L/R + basic touch/swipe (R-7).
 *
 * DuckDuckGo / iOS: keep handlers simple. pointerup + click with debounce
 * (avoid touchend preventDefault wars that can kill gesture audio).
 *
 * @param {{
 *   onChoose: (lane: number) => void,
 *   leftBtn?: HTMLElement | null,
 *   rightBtn?: HTMLElement | null,
 *   swipeEl?: HTMLElement | null,
 * }} handlers
 */
export function createInput(handlers) {
  const { onChoose, leftBtn, rightBtn, swipeEl } = handlers;

  let lastChooseAt = 0;
  const DEDUPE_MS = 120;

  function choose(lane) {
    const now = performance.now();
    if (now - lastChooseAt < DEDUPE_MS) return;
    lastChooseAt = now;
    onChoose(lane);
  }

  function onKeyDown(e) {
    if (e.repeat) return;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      e.preventDefault();
      choose(LANE.LEFT);
    } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      e.preventDefault();
      choose(LANE.RIGHT);
    }
  }

  window.addEventListener("keydown", onKeyDown);

  function bindButton(btn, lane) {
    if (!btn) return () => {};

    // pointerup = finger lift (good gesture for audio.play on iOS)
    // click = mouse / accessibility fallback
    const onPointerUp = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      choose(lane);
    };
    const onClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      choose(lane);
    };

    btn.addEventListener("pointerup", onPointerUp);
    btn.addEventListener("click", onClick);

    return () => {
      btn.removeEventListener("pointerup", onPointerUp);
      btn.removeEventListener("click", onClick);
    };
  }

  const unbindLeft = bindButton(leftBtn, LANE.LEFT);
  const unbindRight = bindButton(rightBtn, LANE.RIGHT);

  let touchStartX = null;
  let touchStartY = null;
  const SWIPE_MIN = 36;

  function onPointerDown(e) {
    if (e.target && e.target.closest && e.target.closest("button, .overlay-card")) {
      return;
    }
    touchStartX = e.clientX;
    touchStartY = e.clientY;
  }

  function onPointerUp(e) {
    if (touchStartX == null || touchStartY == null) return;
    const dx = e.clientX - touchStartX;
    const dy = e.clientY - touchStartY;
    touchStartX = null;
    touchStartY = null;
    if (Math.abs(dx) < SWIPE_MIN) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.15) return;
    choose(dx < 0 ? LANE.LEFT : LANE.RIGHT);
  }

  function onPointerCancel() {
    touchStartX = null;
    touchStartY = null;
  }

  const swipeTarget = swipeEl || null;
  if (swipeTarget) {
    swipeTarget.addEventListener("pointerdown", onPointerDown);
    swipeTarget.addEventListener("pointerup", onPointerUp);
    swipeTarget.addEventListener("pointercancel", onPointerCancel);
    swipeTarget.addEventListener("pointerleave", onPointerCancel);
  }

  return {
    dispose() {
      window.removeEventListener("keydown", onKeyDown);
      unbindLeft();
      unbindRight();
      if (swipeTarget) {
        swipeTarget.removeEventListener("pointerdown", onPointerDown);
        swipeTarget.removeEventListener("pointerup", onPointerUp);
        swipeTarget.removeEventListener("pointercancel", onPointerCancel);
        swipeTarget.removeEventListener("pointerleave", onPointerCancel);
      }
    },
  };
}
