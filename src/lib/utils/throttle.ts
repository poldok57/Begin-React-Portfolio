export const throttle = (func: () => void, delay: number = 2000) => {
  let lastCall = 0;
  return () => {
    const now = new Date().getTime();
    if (now - lastCall >= delay) {
      lastCall = now;
      func();
    }
  };
};
