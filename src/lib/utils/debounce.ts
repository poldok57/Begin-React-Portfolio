let timeoutDebouce: NodeJS.Timeout;

// export const debounce = <T extends (...args: unknown[]) => unknown>(
//   func: T,
//   delay: number = 600
// ) => {
//   return (...args: Parameters<T>) => {
//     clearTimeout(timeoutDebouce);

//     timeoutDebouce = setTimeout(() => {
//       func(...args);
//     }, delay);
//   };
// };

export const debounce = <T extends unknown[]>(
  callback: (...args: T) => void,
  time: number
) => {
  const onDebounce = (...args: T) => {
    if (timeoutDebouce) clearTimeout(timeoutDebouce);
    timeoutDebouce = setTimeout(() => {
      callback(...args);
    }, time);
  };

  return onDebounce;
};
