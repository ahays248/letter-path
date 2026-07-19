/**
 * Multi-word set progress: stars per word, advance order.
 */

export function createWordSet(entries) {
  const words = entries.map((e) => ({
    word: String(e.word).toUpperCase(),
    color: e.color || "#fef3c7",
    image: e.image,
    video: e.video,
  }));

  let index = 0;
  /** @type {boolean[]} */
  let earned = words.map(() => false);

  function current() {
    return words[index] || null;
  }

  function stars() {
    return earned.filter(Boolean).length;
  }

  function total() {
    return words.length;
  }

  function starsDisplay() {
    // ★ filled, ☆ empty
    let s = "";
    for (let i = 0; i < words.length; i++) {
      s += earned[i] ? "★" : "☆";
    }
    return s;
  }

  /**
   * Call when current word is spelled correctly (first time).
   * @returns {{ setComplete: boolean, next: object | null, alreadyHad: boolean }}
   */
  function completeCurrentWord() {
    if (index >= words.length) {
      return { setComplete: true, next: null, alreadyHad: true };
    }
    const alreadyHad = earned[index];
    if (!alreadyHad) earned[index] = true;
    index += 1;
    if (index >= words.length) {
      return { setComplete: true, next: null, alreadyHad };
    }
    return { setComplete: false, next: words[index], alreadyHad };
  }

  function resetSet() {
    index = 0;
    earned = words.map(() => false);
  }

  /** After set complete celebration, start over */
  function restartSet() {
    resetSet();
    return current();
  }

  function getIndex() {
    return index;
  }

  function isSetComplete() {
    return index >= words.length;
  }

  return {
    current,
    stars,
    total,
    starsDisplay,
    completeCurrentWord,
    resetSet,
    restartSet,
    getIndex,
    isSetComplete,
    getWords: () => words.map((w) => w.word),
  };
}
