export async function imageLoadInCanvas(
  dataURL: string | null
): Promise<HTMLCanvasElement | null> {
  return new Promise((resolve, reject) => {
    if (!dataURL) {
      reject(new Error("Invalid data URL"));
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

    const img = new Image();
    img.src = dataURL;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
  });
}
