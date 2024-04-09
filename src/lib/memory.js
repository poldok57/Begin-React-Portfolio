/**
 * Copied from https://bost.ocks.org/mike/shuffle/
 * @param array Array to be shuffled
 * @returns {*[]}
 */
export const shuffle = (array) => {
  let m = array.length,
    t,
    i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
};

export const PREVIEW_TIMEOUT = 5000;
export const HIDE_TIMEOUT = 5000;
export const PREVIEW_FIRSTCART = 20000;

const animals = [
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐵",
  "🐔",
  "🐧",
  "🐦",
];

const images = [
  "/card-1-250.jpg",
  "/card-2-250.jpg",
  "/card-3-250.jpg",
  "/card-4-250.jpg",
  "/card-5-250.jpg",
  "/card-6-250.jpg",
  "/card-7-250.jpg",
  "/card-8-250.jpg",
  "/card-9-250.jpg",
  "/card-10-250.jpg",
  "/card-11-250.jpg",
  "/card-12-250.jpg",
  "/card-13-250.jpg",
  "/card-14-250.jpg",
  "/card-15-250.jpg",
  "/card-16-250.jpg",
  "/card-17-250.jpg",
  "/card-18-250.jpg",
  "/card-19-250.jpg",
  "/card-20-250.jpg",
  "/card-21-250.jpg",
  "/card-22-250.jpg",
  "/card-24-250.jpg",
  "/card-25-250.jpg",
  "/card-26-250.jpg",
  "/card-27-250.jpg",
  "/card-28-250.jpg",
  "/card-29-250.jpg",
  "/card-30-250.jpg",
  "/card-31-250.jpg",
  "/card-32-250.jpg",
  "/card-33-250.jpg",
  "/card-34-250.jpg",
  "/card-35-250.jpg",
  "/card-36-250.jpg",
  "/card-37-250.jpg",
  // "/card-23-250.jpg",
];

export const CARD_STATE = {
  HIDE: "hide",
  FIND: "find",
  RETURNED: "returned",
};

export const getInitialMemory = (maxi = 0, typeImages = "images") => {
  if (maxi < 8) maxi = 8;
  let selectedImages = typeImages == "images" ? images : animals;
  const nbr = Math.min(Math.floor(maxi / 2), selectedImages.length);

  if (nbr < selectedImages.length) {
    selectedImages = shuffle(selectedImages);
  }

  selectedImages = selectedImages.slice(0, nbr);

  return shuffle([...selectedImages, ...selectedImages]).map((v, i) => ({
    id: `card-${v}-${i}`,
    emoji: v,
    state: CARD_STATE.HIDE,
  }));
};

export const GAME_STATUS = {
  PLAYING: "playing",
  FINISHED: "finished",
  WAITING_FOR_SECOND_CARD: "waitingForSecondCard",
  WAIT_FOR_CLEAR: "waitForReturn",
};

export const GAME_ACTION = {
  ReturnCard: "ReturnCard",
  Clear: "Clear",
};

export const isPairCards = (card1, card2) => {
  return card1.emoji === card2.emoji;
};

export const isMemoryFinished = (cards) => {
  return cards.every((card) => card.state === CARD_STATE.FIND);
};
