/* eslint-disable @typescript-eslint/no-explicit-any */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = 2000
) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = new Date().getTime();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
    return undefined;
  };
};
