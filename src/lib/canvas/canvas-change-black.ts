export const changeBlack = (ctx: CanvasRenderingContext2D, color: string) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  // Get image data from canvas
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Convert target color to RGB
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) return;

  tempCtx.fillStyle = color;
  tempCtx.fillRect(0, 0, 1, 1);
  const targetRGB = tempCtx.getImageData(0, 0, 1, 1).data;

  // Process each pixel
  for (let i = 0; i < data.length; i += 4) {
    // Get grayscale value (average of RGB)
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;

    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const min = Math.min(data[i], data[i + 1], data[i + 2]);

    // Check if pixel is dark (black or dark gray)
    if (gray < 196 && Math.abs(max - min) < 15) {
      // Calculate brightness ratio (0-1)
      const brightness = 1 + gray / 255;

      // Apply target color with adjusted brightness
      data[i] = Math.min(255, Math.round(targetRGB[0] * brightness)); // R
      data[i + 1] = Math.min(255, Math.round(targetRGB[1] * brightness)); // G
      data[i + 2] = Math.min(255, Math.round(targetRGB[2] * brightness)); // B
      // Alpha channel remains unchanged
    }
  }

  // Create a new canvas with same dimensions
  // const newCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;

  // Put modified image data on new canvas
  tempCtx.putImageData(imageData, 0, 0);

  return tempCanvas;
};
