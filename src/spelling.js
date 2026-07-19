import { LANE } from "./constants.js";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomDecoy(correct) {
  let d;
  do {
    d = ALPHABET[(Math.random() * 26) | 0];
  } while (d === correct);
  return d;
}

function randomSide() {
  return Math.random() < 0.5 ? LANE.LEFT : LANE.RIGHT;
}

/**
 * Next-letter spelling for one continuous path run.
 * Precomputes all forks so the whole word is laid out on the road.
 */
export function createSpelling(targetWord = "CAT") {
  let word = String(targetWord).toUpperCase();
  /** @type {{ left: string, right: string, correctLane: number, correct: string }[]} */
  let forks = [];
  let index = 0;
  let locked = [];
  let status = "playing"; // playing | complete | oops
  let message = "";

  function buildForks() {
    forks = [];
    for (let i = 0; i < word.length; i++) {
      const correct = word[i];
      const decoy = randomDecoy(correct);
      const correctLane = randomSide();
      const left = correctLane === LANE.LEFT ? correct : decoy;
      const right = correctLane === LANE.RIGHT ? correct : decoy;
      forks.push({ left, right, correctLane, correct });
    }
  }

  function startWord() {
    index = 0;
    locked = [];
    status = "playing";
    message = "";
    buildForks();
  }

  /** Switch to a new target word and rebuild forks. */
  function loadWord(nextWord) {
    word = String(nextWord).toUpperCase();
    startWord();
  }

  startWord();

  function currentFork() {
    return forks[index] || null;
  }

  /**
   * @param {number} lane
   * @returns {"correct" | "complete" | "wrong"}
   */
  function resolveCommit(lane) {
    if (status === "complete") {
      startWord();
      return "wrong";
    }

    const fork = currentFork();
    if (!fork) {
      return "wrong";
    }

    const ok = lane === fork.correctLane;
    if (!ok) {
      status = "oops";
      message = "Oops, try again!";
      index = 0;
      locked = [];
      buildForks();
      return "wrong";
    }

    locked.push(word[index]);
    index += 1;
    status = "playing";
    message = "";

    if (index >= word.length) {
      status = "complete";
      message = `You spelled ${word}!`;
      return "complete";
    }

    return "correct";
  }

  function restartAfterComplete() {
    startWord();
  }

  function getProgressDisplay() {
    const chars = [];
    for (let i = 0; i < word.length; i++) {
      chars.push(i < locked.length ? locked[i] : "_");
    }
    return chars.join(" ");
  }

  return {
    startWord,
    loadWord,
    resolveCommit,
    restartAfterComplete,
    getProgressDisplay,
    getTarget: () => word,
    getIndex: () => index,
    getLocked: () => locked.slice(),
    getForks: () => forks.map((f) => ({ ...f })),
    getFork: (i) => (forks[i] ? { ...forks[i] } : null),
    getLeftLetter: () => currentFork()?.left ?? "?",
    getRightLetter: () => currentFork()?.right ?? "?",
    getCorrectLane: () => currentFork()?.correctLane ?? LANE.LEFT,
    getStatus: () => status,
    getMessage: () => message,
    clearMessage() {
      if (status === "oops") {
        status = "playing";
        message = "";
      }
    },
  };
}
