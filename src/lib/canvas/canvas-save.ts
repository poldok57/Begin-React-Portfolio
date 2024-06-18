import GIF from "gif.js";

export const downloadCanvasToPNG = (
  canvas: HTMLCanvasElement,
  filename: string
): void => {
  if (!canvas) {
    return;
  }

  const dataURL = canvas.toDataURL();
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = filename + ".png";
  link.click();
};

// Fonction pour convertir le canevas en SVG
const canvasToSVG = (canvas: HTMLCanvasElement) => {
  var svgNS = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "" + canvas.width);
  svg.setAttribute("height", "" + canvas.height);

  var image = document.createElementNS(svgNS, "image");
  image.setAttribute("href", canvas.toDataURL("image/png"));
  image.setAttribute("x", "0");
  image.setAttribute("y", "0");
  image.setAttribute("width", "" + canvas.width);
  image.setAttribute("height", "" + canvas.height);
  svg.appendChild(image);

  var serializer = new XMLSerializer();
  var svgString = serializer.serializeToString(svg);
  return svgString;
};

// Fonction pour télécharger le SVG
export const downloadCanvasToSVG = (
  canvas: HTMLCanvasElement,
  filename: string
) => {
  if (!canvas) {
    return;
  }
  const svgString = canvasToSVG(canvas);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename + ".svg");
  // document.body.appendChild(link);
  link.click();
  // document.body.removeChild(link);
};

export const downloadCanvasToGIF = (
  canvas: HTMLCanvasElement,
  filename: string
) => {
  if (!canvas) {
    return;
  }
  const gif = new GIF({
    workers: 2,
    quality: 10,
    workerScript: "/js/gif.worker.js",
  });

  gif.addFrame(canvas, { copy: true, delay: 200 });

  gif.on("finished", (blob: Blob) => {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename + ".gif");
    link.click();
  });

  // gif.on("progress", (progress: number) => {
  //   console.log(`Progress: ${(progress * 100).toFixed(2)}%`);
  // });

  gif.render();
};
