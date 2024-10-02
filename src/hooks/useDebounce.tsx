import React from "react";

export const useDebounce = <T extends unknown[]>(
  callback: (...args: T) => void,
  time: number
) => {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const onDebounce = (...args: T) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, time);
  };

  return onDebounce;
};

export const useInterval = (interval = 300) => {
  const lastAccess = React.useRef(0);

  if (lastAccess.current === 0) {
    lastAccess.current = Date.now();
    return true;
  }
  if (Date.now() - lastAccess.current < interval) {
    return false;
  }
  lastAccess.current = 0;
  return true;
};
