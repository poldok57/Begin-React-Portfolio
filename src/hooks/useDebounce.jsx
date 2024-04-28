import React from "react";

export const useDebounce = (callback, time) => {
  const timeoutRef = React.useRef(null);

  const onDebounce = (...args) => {
    if (timeoutRef) clearTimeout(timeoutRef.current);
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
