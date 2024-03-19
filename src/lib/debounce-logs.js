let timer = null;
export const debounceLogs = (...args) => {
  if (timer) clearTimeout(timer);
  try {
    timer = setTimeout(() => {
      console.log(...args);
    }, 500);
  } catch (e) {
    if (timer) clearTimeout(timer);
  }
};
