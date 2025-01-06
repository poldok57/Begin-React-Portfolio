export const debounce = <T extends unknown[]>(
  callback: (...args: T) => void,
  time: number
) => {
  let timeoutDebouce: NodeJS.Timeout;

  const onDebounce = (...args: T) => {
    if (timeoutDebouce) clearTimeout(timeoutDebouce);
    timeoutDebouce = setTimeout(() => {
      callback(...args);
    }, time);
  };

  return onDebounce;
};

export const debounceThrottle = <T extends unknown[]>(
  callback: (...args: T) => void,
  time: number,
  finalDelay: number
) => {
  let lastExecTime = 0;
  let timeoutDebouce: NodeJS.Timeout | null = null;

  const onDebounce = (...args: T) => {
    if (timeoutDebouce) {
      clearTimeout(timeoutDebouce);
      timeoutDebouce = null;
    }

    const now = Date.now();
    if (now - lastExecTime >= time) {
      lastExecTime = now;
      callback(...args);
      return;
    }

    timeoutDebouce = setTimeout(() => {
      callback(...args);
    }, finalDelay);
  };

  return onDebounce;
};
