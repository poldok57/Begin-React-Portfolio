export function getContrastColor(hexColor: string): string {
  // Enlever le # si présent
  const color =
    hexColor.charAt(0) === "#" ? hexColor.substring(1, 7) : hexColor;

  // Convertir en RGB
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);

  // Calculer la luminosité
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Retourner blanc ou noir selon la luminosité
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

export const adjustBrightness = (color: string, intensity: number): string => {
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const factor = 1 + intensity / 100;

  const newR = Math.min(255, Math.round(r * factor));
  const newG = Math.min(255, Math.round(g * factor));
  const newB = Math.min(255, Math.round(b * factor));

  return `#${newR.toString(16).padStart(2, "0")}${newG
    .toString(16)
    .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
};
