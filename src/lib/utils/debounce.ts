export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
