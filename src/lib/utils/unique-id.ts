export const generateUniqueId = (prefix: string = "id") => {
  return `${prefix}_${Date.now().toString().slice(6, 13)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
};
