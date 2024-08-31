import { useRef } from "react";

export const useThrottle = (func: () => void, delay: number = 2000) => {
  const lastCall = useRef(0);
  return () => {
    const now = new Date().getTime();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      func();
    }
  };
};
