let timer = null;
export const debounceLogs = (...args) => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    console.log(...args);
  }, 500);
};
