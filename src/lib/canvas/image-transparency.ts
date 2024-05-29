export const makeWhiteTransparent = (
  canvas: HTMLCanvasElement | null,
  canvasDest: HTMLCanvasElement | null,
  clarityLevel: number
): void => {
  if (canvas === null) return;
  if (!canvasDest) canvasDest = canvas;
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
  let ctxDest: CanvasRenderingContext2D = canvasDest?.getContext("2d") || ctx;
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  const maxWhite = 255 - clarityLevel;
  const maxTotal = 3.2 * maxWhite;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Check if the pixel is white (RGB value of 255, 255, 255)
    if (
      (r >= maxWhite && g >= maxWhite && b >= maxWhite) ||
      (r + g + b >= maxTotal && Math.max(r, g, b) - Math.min(r, g, b) < 10)
    ) {
      // Set the alpha channel to 0 (transparent)
      data[i + 3] = 0;
    }
  }
  // remove transparency from the subject
  canvasDest.width = canvas.width;
  canvasDest.height = canvas.height;

  // searchSubject(imageData);
  ctxDest.putImageData(imageData, 0, 0);
};

export const makeWhiteTransparent2 = (
  canvas: HTMLCanvasElement | null,
  canvasDest: HTMLCanvasElement | null,
  clarityLevel: number
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

  clarityLevel = 255 - clarityLevel;
  // Première passe : Supprimer les points clairs
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Convertir la couleur en niveau de gris
    const gray = 0.3 * r + 0.59 * g + 0.11 * b;

    // Supprimer les points clairs proches du gris
    if (gray > clarityLevel) {
      data[i + 3] = 0; // Rendre transparent
    }
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
