let timeoutDebouce: NodeJS.Timeout;

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number = 600
) => {
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutDebouce);

    timeoutDebouce = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
