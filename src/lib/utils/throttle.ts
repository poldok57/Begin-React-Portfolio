/* eslint-disable @typescript-eslint/no-explicit-any */
let throttleLastCall = 0;
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = 2000
) => {
  return (...args: Parameters<T>) => {
    const now = new Date().getTime();
    if (now - throttleLastCall >= delay) {
      throttleLastCall = now;
      return func(...args);
    }
    return undefined;
  };
};
