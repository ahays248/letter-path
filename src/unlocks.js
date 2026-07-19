/**
 * Light meta unlocks (v0: bow after first full set clear).
 * Persists in localStorage when available.
 */

const STORAGE_KEY = "letterPath.unlocked";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { bow: false };
    const data = JSON.parse(raw);
    return { bow: Boolean(data.bow) };
  } catch {
    return { bow: false };
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // private mode / blocked storage — in-memory only
  }
}

export function createUnlocks() {
  let state = load();

  function hasBow() {
    return state.bow;
  }

  /** @returns {boolean} true if this call newly unlocked the bow */
  function unlockBow() {
    if (state.bow) return false;
    state = { ...state, bow: true };
    save(state);
    return true;
  }

  /** Dev / testing */
  function resetUnlocks() {
    state = { bow: false };
    save(state);
  }

  return {
    hasBow,
    unlockBow,
    resetUnlocks,
    getState: () => ({ ...state }),
  };
}
