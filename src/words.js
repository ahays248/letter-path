/**
 * Animal CVC bank for v0 set.
 * Imagine portraits live at assets/animals/{word}.jpg (Three.js TextureLoader).
 * Canvas art in animalArt.js is the offline fallback.
 */
export const ANIMAL_SET = [
  {
    word: "CAT",
    color: "#f59e0b",
    image: "assets/animals/cat.jpg",
    video: "assets/animals/video/cat.mp4",
  },
  {
    word: "DOG",
    color: "#a16207",
    image: "assets/animals/dog.jpg",
    video: "assets/animals/video/dog.mp4",
  },
  {
    word: "PIG",
    color: "#f9a8d4",
    image: "assets/animals/pig.jpg",
    video: "assets/animals/video/pig.mp4",
  },
  {
    word: "HEN",
    color: "#fde047",
    image: "assets/animals/hen.jpg",
    video: "assets/animals/video/hen.mp4",
  },
  {
    word: "COW",
    color: "#e5e5e5",
    image: "assets/animals/cow.jpg",
    video: "assets/animals/video/cow.mp4",
  },
  {
    word: "BUG",
    color: "#4ade80",
    image: "assets/animals/bug.jpg",
    video: "assets/animals/video/bug.mp4",
  },
  {
    word: "FOX",
    color: "#fb923c",
    image: "assets/animals/fox.jpg",
    video: "assets/animals/video/fox.mp4",
  },
  {
    word: "BAT",
    color: "#6b7280",
    image: "assets/animals/bat.jpg",
    video: "assets/animals/video/bat.mp4",
  },
];

export function wordEntry(word) {
  const w = String(word).toUpperCase();
  return (
    ANIMAL_SET.find((e) => e.word === w) || {
      word: w,
      color: "#fef3c7",
    }
  );
}
