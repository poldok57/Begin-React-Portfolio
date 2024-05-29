export const makeBlackAndWhite = (
  canvas: HTMLCanvasElement | null,
  canvasDest: HTMLCanvasElement | null
): void => {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D context");
  }
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Convertir la couleur en niveau de gris
    const gray = 0.3 * r + 0.59 * g + 0.11 * b;

    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  if (canvasDest === null) {
    ctx.putImageData(imageData, 0, 0);
    return;
  }
  // put the modified image data in a new canvas
  canvasDest.width = canvas.width;
  canvasDest.height = canvas.height;
  // Mettre à jour l'image après la deuxième passe
  const ctxDest = canvasDest?.getContext("2d") || ctx;

  ctxDest.putImageData(imageData, 0, 0);
};
