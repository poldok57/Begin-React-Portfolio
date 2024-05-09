const getAlphaLines = (canvas) => {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let lines = [];

  for (let y = 0; y < canvas.height; y++) {
    // Crée un nouveau tableau pour chaque ligne
    let lineData = new Uint8ClampedArray(canvas.width);
    for (let x = 0; x < canvas.width; x++) {
      let index = (y * canvas.width + x) * 4;
      lineData[x] = data[index + 3]; // Accès direct à la valeur alpha
    }
    lines.push(lineData);
  }

  return lines;
};

// rechercher la taille de l'image dans le canvas
export const imageSize = (canvas) => {
  const { width, height } = canvas.getBoundingClientRect();
  const lines = getAlphaLines(canvas);

  let top = null;
  let bottom = null;
  let left = null;
  let right = null;

  // Détermination de la première ligne non entièrement transparente
  for (let y = 0; y < height; y++) {
    if (lines[y].some((alpha) => alpha > 0)) {
      top = y;
      break;
    }
  }

  // Détermination de la dernière ligne non entièrement transparente
  for (let y = height - 1; y >= top; y--) {
    if (lines[y].some((alpha) => alpha > 0)) {
      bottom = y;
      break;
    }
  }

  // Trouver la colonne la plus à gauche avec des pixels non transparents
  for (let x = 0; x < width; x++) {
    if (lines.some((line) => line[x] > 0)) {
      left = x;
      break;
    }
  }

  // Trouver la colonne la plus à droite avec des pixels non transparents
  for (let x = width - 1; x >= left; x--) {
    if (lines.some((line) => line[x] > 0)) {
      right = x;
      break;
    }
  }

  // S'assurer que tous les bords ont été trouvés avant de calculer les dimensions
  if (top !== null && bottom !== null && left !== null && right !== null) {
    const usedWidth = right - left + 1;
    const usedHeight = bottom - top + 1;
    return {
      width: usedWidth,
      height: usedHeight,
      // top,
      // bottom,
      // left,
      // right,
      x: left,
      y: top,
    };
  } else {
    return null; // Retourne null si aucune partie de l'image n'est utilisée
  }
};

/**
 * Cuts out a specific area of the canvas and returns it as a canvas
 */
const cutOutArea = (canvas, area) => {
  const { x, y, width, height } = area;
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = width;
  tempCanvas.height = height;
  tempCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
  return tempCanvas;
};
/**
 * Save selected area of canvas as image
 * @param {HTMLCanvasElement} canvas
 * @param {string} filename
 * @param {Object} area
 */
export const saveCanvas = (canvas, filename, area = null) => {
  if (area === null) {
    area = imageSize(canvas);
    if (area === null) {
      return;
    }
  }
  const tempCanvas = cutOutArea(canvas, area);

  const dataURL = tempCanvas.toDataURL();
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = filename + ".png";
  link.click();
};
