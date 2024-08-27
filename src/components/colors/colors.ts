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
