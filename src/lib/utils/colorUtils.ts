/**
 * Color utilities for generating harmonious color schemes
 * Used for creating random table templates with good contrast
 */

// Color scheme interface
export interface ColorScheme {
  fillColor: string;
  borderColor: string;
  numberColor: string;
  textColor: string;
  colorName?: string; // Name of the main color for template naming
}

// Color pair interface
interface ColorPair {
  main: string;
  secondary: string;
  name: string; // English name of the color
}

// Pre-defined harmonious color pairs with good contrast between main and secondary
export const harmonicColorPairs: ColorPair[] = [
  { main: "#3498db", secondary: "#1a4971", name: "Blue" },
  { main: "#2ecc71", secondary: "#1a6d3d", name: "Green" },
  { main: "#e74c3c", secondary: "#7c2a22", name: "Red" },
  { main: "#9b59b6", secondary: "#5b3566", name: "Purple" },
  { main: "#f1c40f", secondary: "#7f680b", name: "Yellow" },
  { main: "#1abc9c", secondary: "#0e6655", name: "Turquoise" },
  { main: "#34495e", secondary: "#1a2530", name: "Navy" },
  { main: "#e67e22", secondary: "#7d4314", name: "Orange" },
  { main: "#7f8c8d", secondary: "#4a5051", name: "Gray" },
  { main: "#16a085", secondary: "#0b5549", name: "Teal" },
  { main: "#d35400", secondary: "#6e2c00", name: "Burnt Orange" },
  { main: "#8e44ad", secondary: "#4a2459", name: "Violet" },
  { main: "#27ae60", secondary: "#145a32", name: "Emerald" },
  { main: "#c0392b", secondary: "#661e17", name: "Crimson" },
  { main: "#f39c12", secondary: "#7f510a", name: "Amber" },
  { main: "#2980b9", secondary: "#164666", name: "Royal Blue" },
  { main: "#2c3e50", secondary: "#151f28", name: "Midnight Blue" },
];

// Accent colors for text that stand out on various backgrounds
export const accentColors: string[] = [
  "#e74c3c", // Red
  "#3498db", // Blue
  "#2ecc71", // Green
  "#9b59b6", // Purple
  "#f39c12", // Orange
  "#1abc9c", // Turquoise
  "#e67e22", // Dark Orange
  "#c0392b", // Darker Red
  "#27ae60", // Darker Green
  "#8e44ad", // Darker Purple
  "#d35400", // Burnt Orange
  "#16a085", // Darker Turquoise
];

/**
 * Calculate the luminance of a color to determine if it's light or dark
 * @param color - Hex color string
 * @returns Luminance value between 0 (dark) and 1 (light)
 */
export const calculateLuminance = (color: string): number => {
  // Convert hex to RGB
  const r = parseInt(color.substring(1, 3), 16) / 255;
  const g = parseInt(color.substring(3, 5), 16) / 255;
  const b = parseInt(color.substring(5, 7), 16) / 255;

  // Calculate relative luminance using the sRGB color space formula
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance;
};

/**
 * Get a contrasting color (black or white) based on background luminance
 * @param bgColor - Background color in hex format
 * @returns Black or white depending on which provides better contrast
 */
export const getContrastColor = (bgColor: string): string => {
  const luminance = calculateLuminance(bgColor);
  return luminance > 0.5 ? "#000000" : "#ffffff";
};

/**
 * Get a random element from an array
 * @param array - Array to select from
 * @returns Random element from the array
 */
export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Generate a harmonious color scheme for a table template
 * @param usedSchemes - Array of previously used color schemes to avoid duplicates
 * @returns Object with fillColor, borderColor, numberColor, and textColor
 */
export const generateColorScheme = (
  usedSchemes: ColorScheme[] = []
): ColorScheme => {
  // Try to find a color scheme that hasn't been used yet
  let attempts = 0;
  let colorPair: ColorPair;
  let isDuplicate = false;

  do {
    colorPair = getRandomElement(harmonicColorPairs);
    isDuplicate = usedSchemes.some(
      (scheme) =>
        scheme.fillColor === colorPair.main &&
        scheme.borderColor === colorPair.secondary
    );
    attempts++;
  } while (isDuplicate && attempts < 15); // Prevent infinite loop

  const { main, secondary, name } = colorPair;
  const numberColor = getContrastColor(main);

  // Generate a text color that's different from numberColor but still contrasts with background
  let textColor;

  if (numberColor === "#000000") {
    // If number is black, use a dark accent color
    textColor = getRandomElement(
      accentColors.filter((color) => calculateLuminance(color) < 0.6)
    );
  } else {
    // If number is white, use a light accent color
    textColor = getRandomElement(
      accentColors.filter((color) => calculateLuminance(color) > 0.4)
    );
  }

  return {
    fillColor: main,
    borderColor: secondary,
    numberColor: numberColor,
    textColor: textColor || getRandomElement(accentColors),
    colorName: name,
  };
};

/**
 * Create multiple unique color schemes for table templates
 * @param count - Number of color schemes to generate
 * @returns Array of color schemes
 */
export const generateMultipleColorSchemes = (count: number): ColorScheme[] => {
  const schemes: ColorScheme[] = [];
  for (let i = 0; i < count; i++) {
    schemes.push(generateColorScheme(schemes));
  }
  return schemes;
};
