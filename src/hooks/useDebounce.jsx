import React from 'react';

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
