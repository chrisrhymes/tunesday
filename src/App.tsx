import { categories, type CategoryProps } from "./categories.ts";
import { useState, type CSSProperties, type SVGProps } from "react";

const ROLLS = 5;
const PAUSE_MS = 1000;
const NOTE_COUNT = 100;

// Full class names listed so Tailwind can detect them at build time.
const FUCHSIA_SHADES = [
  "text-fuchsia-50",
  "text-fuchsia-100",
  "text-fuchsia-200",
  "text-fuchsia-300",
  "text-fuchsia-400",
  "text-fuchsia-500",
  "text-fuchsia-600",
  "text-fuchsia-700",
  "text-fuchsia-800",
  "text-fuchsia-900",
  "text-fuchsia-950",
];

interface Note {
  id: number;
  colour: string;
  dx: string;
  dy: string;
  rotate: string;
  duration: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function random<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

// Each note gets a random direction, distance, spin, speed and colour.
function createNotes(): Note[] {
  return Array.from({ length: NOTE_COUNT }, (_, id) => {
    const angle = randomBetween(0, Math.PI * 2);
    const distance = randomBetween(40, 80); // in vmax, so it reaches the edges
    return {
      id,
      colour: random(FUCHSIA_SHADES),
      dx: `${Math.cos(angle) * distance}vmax`,
      dy: `${Math.sin(angle) * distance}vmax`,
      rotate: `${randomBetween(-360, 360)}deg`,
      duration: `${randomBetween(2, 4)}s`,
    };
  });
}

const MusicNote = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z"
      clipRule="evenodd"
    />
  </svg>
);

const App = () => {
  const [chosenCategory, setChosenCategory] = useState<CategoryProps | null>(
    null,
  );
  const [chosenOption, setChosenOption] = useState<string | null>(null);
  const [complete, setComplete] = useState<boolean>(false);
  const [notes, setNotes] = useState<Note[]>([]);
  // Incremented on every roll so the element remounts and replays its
  // animation, even when the same value is picked twice in a row.
  const [categoryRollId, setCategoryRollId] = useState(0);
  const [optionRollId, setOptionRollId] = useState(0);
  const [isRolling, setIsRolling] = useState(false);

  // Picks a random item ROLLS times, pausing PAUSE_MS between each pick.
  // Returns the final pick.
  const roll = async <T,>(
    items: T[],
    onPick: (item: T) => void,
  ): Promise<T> => {
    let item = random(items);
    for (let i = 0; i < ROLLS; i++) {
      if (i > 0) await sleep(PAUSE_MS);
      item = random(items);
      onPick(item);
    }
    return item;
  };

  const letsGo = async () => {
    setComplete(false);
    if (isRolling) return;
    setIsRolling(true);

    // Clear previously chosen options
    setChosenCategory(null);
    setChosenOption(null);

    const category = await roll(categories, (picked) => {
      setChosenCategory(picked);
      setCategoryRollId((id) => id + 1);
    });

    // Pause on the final category before rolling its options
    await sleep(PAUSE_MS);

    await roll(category.options, (picked) => {
      setChosenOption(picked);
      setOptionRollId((id) => id + 1);
    });

    setIsRolling(false);
    setNotes(createNotes());
    setComplete(true);
  };

  return (
    <div className="container mx-auto flex min-h-dvh flex-col items-center justify-center gap-8 p-4">
      <h1 className="my-8 font-serif text-6xl font-bold text-fuchsia-800 text-shadow-fuchsia-400 text-shadow-lg md:text-8xl">
        Tunesday
      </h1>

      {chosenCategory && (
        <div className="mb-8 flex items-center justify-center overflow-hidden rounded border-2 border-fuchsia-800 px-4 py-2">
          <span
            key={`category-${categoryRollId}`}
            className="animate-scroll-in inline-block text-2xl font-bold whitespace-pre text-fuchsia-800"
          >
            {chosenCategory.label}
          </span>
          {chosenOption && (
            <span
              key={`option-${optionRollId}`}
              className="animate-scroll-in inline-block text-2xl font-bold text-fuchsia-800"
            >
              {chosenOption}
            </span>
          )}
          {!complete && (
            <span className="text-fuchsia-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="ml-4 size-6 animate-spin"
              >
                <path
                  fillRule="evenodd"
                  d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </div>
      )}

      {!isRolling && (
        <button
          className="cursor-pointer rounded border-2 border-fuchsia-800 bg-white px-4 py-2 text-lg text-fuchsia-800 hover:bg-fuchsia-800 hover:text-white focus:outline-4 focus:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => letsGo()}
          disabled={isRolling}
        >
          {complete ? (
            <span className="flex flex-row items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-4 size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
                  clipRule="evenodd"
                />
              </svg>
              Try again
            </span>
          ) : (
            <span className="flex flex-row items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-4 size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z"
                  clipRule="evenodd"
                />
              </svg>
              Choose a theme
            </span>
          )}
        </button>
      )}

      {complete && (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden">
          {notes.map((note) => (
            <MusicNote
              key={note.id}
              className={`animate-fly-away absolute size-8 ${note.colour}`}
              style={
                {
                  "--dx": note.dx,
                  "--dy": note.dy,
                  "--rotate": note.rotate,
                  size: "20",
                  animationDuration: note.duration,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
