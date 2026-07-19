/**
 * R-6b — short kid-facing lines for **big moments only**
 * (word complete / set complete). Per-letter feedback is chime + VO + strip.
 */

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * @param {{ word?: string }} opts
 */
export function wordCompleteLine(opts = {}) {
  const w = opts.word ? String(opts.word).toUpperCase() : "it";
  const variants = [
    `You spelled ${w}!`,
    `${w}! Nice work!`,
    `Yes — ${w}!`,
  ];
  return pick(variants);
}

/**
 * @param {{ stars?: number, hasBow?: boolean }} opts
 */
export function setCompleteLine(opts = {}) {
  const stars = opts.stars ?? 0;
  if (opts.hasBow) {
    return `Set complete! ${stars} stars`;
  }
  return `Set complete! Something special…`;
}
