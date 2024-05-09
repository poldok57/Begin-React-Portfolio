export const TYPES = {
  IMAGE: "image",
  TEXT: "text",
  SHAPE: "shape",
  LINE: "line",
  ARC: "arc",
};

// Import the store
import useHistoryStore from "../stores/useHistoryStore";

// Function to add history item from non-React JS file
export const addItemToHistory = (item) => {
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

export const setHistoryMaxLen = (length) => {
  // Access the store and use the setMaxLen method
  useHistoryStore.getState().setMaxLen(length);
};

export const eraseHistory = () => {
  // Access the store and use the eraseHistory method
  useHistoryStore.getState().eraseHistory();
};

export const addPictureToHistory = ({
  canvas,
  image = null,
  coordonates = null,
}) => {
  if (!image) {
    if (canvas === null) {
      throw new Error("history: Canvas and image are not defined");
    }
    const ctx = canvas.getContext("2d");
    image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
  const type = TYPES.IMAGE;
  // console.log("addPictureToHistory", image, coordonates);
  addItemToHistory({ type, image, coordonates });
};
