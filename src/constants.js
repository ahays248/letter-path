/**
 * Shared path / lane tuning for Letter Path.
 *
 * Timing between letters ≈ forkSpacing / speed (seconds).
 * Difficulty presets only change speed + forkSpacing (+ endZ room).
 * Later: parent toggle can call applyDifficulty("normal" | "hard").
 */

/** Named difficulty ladders (seconds between letter commits ≈ spacing/speed). */
export const DIFFICULTY_PRESETS = {
  /** Default for ~6yo: more thinking time between letters */
  easy: {
    label: "Easy",
    speed: 4.0,
    forkSpacing: 20,
    /** Extra path after last letter so end feels calm */
    endZ: -72,
  },
  /** Later toggle: tighter gaps */
  normal: {
    label: "Normal",
    speed: 5.0,
    forkSpacing: 14,
    endZ: -56,
  },
  /** Later toggle: challenge */
  hard: {
    label: "Hard",
    speed: 6.0,
    forkSpacing: 11,
    endZ: -48,
  },
};

/** Active difficulty id — default easy until a UI toggle exists */
export let activeDifficultyId = "easy";

export const PATH = {
  startZ: 4,
  endZ: DIFFICULTY_PRESETS.easy.endZ,
  /** Road width; left/right gates each fill half and meet at center */
  width: 3.2,
  /**
   * Player lane center X = ±width/4 so they run down the middle of each gate.
   * Gates use the same half-width so they stay on the road and touch.
   */
  get laneOffset() {
    return this.width / 4;
  },
  /** Half-width of one letter gate (full gate spans one road half) */
  get gateHalfW() {
    return this.width / 4;
  },
  speed: DIFFICULTY_PRESETS.easy.speed,
  /** First fork marker Z (player approaches from higher Z) */
  firstForkZ: -10,
  /** Distance between successive letter forks */
  forkSpacing: DIFFICULTY_PRESETS.easy.forkSpacing,
  /** How far past the letter marker the score commits (run through the letter) */
  commitPastMarker: 1.2,
};

/**
 * Target animal card: fixed sign past the last letters, slightly above the road.
 * Not camera-locked (that covered the whole view and hid forks).
 */
export const GOAL_BILLBOARD = {
  /** Plane size in world units (readable from start, does not cover forks) */
  size: 7.5,
  /** Height of card center above ground */
  y: 5.5,
  /**
   * World Z: just past path end so the whole letter path stays clear.
   * (endZ is negative; this sits slightly beyond the road end.)
   */
  zPastEnd: 4,
  pulseScale: 1.1,
};

/**
 * Apply a difficulty preset onto PATH (mutates PATH).
 * Call before layoutWordOnPath / player reset when switching mid-session.
 * @param {"easy" | "normal" | "hard"} id
 */
export function applyDifficulty(id) {
  const preset = DIFFICULTY_PRESETS[id];
  if (!preset) {
    console.warn("[Letter Path] unknown difficulty:", id);
    return activeDifficultyId;
  }
  activeDifficultyId = id;
  PATH.speed = preset.speed;
  PATH.forkSpacing = preset.forkSpacing;
  PATH.endZ = preset.endZ;
  return id;
}

/** Approximate seconds between successive letter commits at current settings */
export function secondsBetweenLetters() {
  return PATH.forkSpacing / PATH.speed;
}

export const LANE = {
  LEFT: -1,
  CENTER: 0,
  RIGHT: 1,
};

export function laneX(lane) {
  return lane * PATH.laneOffset;
}

/** Marker Z for letter index 0..n-1 */
export function forkMarkerZ(letterIndex) {
  return PATH.firstForkZ - letterIndex * PATH.forkSpacing;
}

/** Commit Z for letter index (slightly past marker, more negative) */
export function forkCommitZ(letterIndex) {
  return forkMarkerZ(letterIndex) - PATH.commitPastMarker;
}
