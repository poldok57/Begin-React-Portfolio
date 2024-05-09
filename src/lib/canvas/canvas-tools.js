export const getCoordinates = (event, canvas) => {
  if (!canvas) return null;

  const rect = canvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

/**
 * Function to clear the contect canvas
 * @param {HTMLCanvasElement} canvas
 */
export const clearCanvasByCtx = (context) => {
  if (!context) return;
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
};
/**
 * Function to clear the canvas
 * @param {HTMLCanvasElement} canvas
 */
export const clearCanvas = (canvas) => {
  const context = canvas.getContext("2d");
  clearCanvasByCtx(context);
};
