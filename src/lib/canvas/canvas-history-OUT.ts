import { Coordinate } from "./types";
import { DRAWING_MODES } from "./canvas-defines";
export type CanvasPicture = {
  type: string;
  canvas: HTMLCanvasElement;
  coordinates: Coordinate | null;
  image: ImageData | null;
};
type HistoryItem = {
  type: string;
  image: ImageData | null;
  coordinates: Coordinate | null;
};

// Import the store
import useHistoryStore from "../stores/useHistoryStore";

// Function to add history item from non-React JS file
export const addItemToHistory: (item: HistoryItem) => void = (item) => {
  // Access the store and use the addHistoryItem method
  useHistoryStore.getState().addHistoryItem(item);
};

export const undoHistory = () => {
  // Access the store and use the undoHistory method
  useHistoryStore.getState().undoHistory();
};

export const getCurrentHistory = () => {
  // Access the store and use the getCurrentHistory method
  return useHistoryStore.getState().getCurrentHistory();
};

export const setHistoryMaxLen: (length: number) => void = (length: number) => {
  // Access the store and use the setMaxLen method
  useHistoryStore.getState().setMaxLen(length);
};

export const eraseHistory = () => {
  // Access the store and use the eraseHistory method
  useHistoryStore.getState().eraseHistory();
};

export const addPictureToHistory: (
  saveCanvasPicture: CanvasPicture
) => void = ({ type = null, canvas, image = null, coordinates = null }) => {
  if (!image) {
    if (canvas === null) {
      throw new Error("history: Canvas and image are not defined");
    }
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      throw new Error("history: Canvas context is not defined");
    }
    image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
  type = type ?? DRAWING_MODES.DRAW;
  // console.log("addPictureToHistory", image, coordonates);
  addItemToHistory({ type, image, coordinates } as HistoryItem);
};
