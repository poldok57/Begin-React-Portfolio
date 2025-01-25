/**
 * Rounds a number to 2 decimal places
 * @param value - The number to round
 * @returns The rounded number
 */
export const roundToTwoDigits = (value: number): number =>
  Number(value.toFixed(2));
