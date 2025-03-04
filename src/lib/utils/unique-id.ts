export const generateUniqueId = (
  prefix: string = "id",
  short: boolean = false
) => {
  if (short) {
    return `${prefix}_${Date.now().toString().slice(5, 9)}_${Math.random()
      .toString(36)
      .slice(2, 6)}`;
  }
  return `${prefix}_${Date.now().toString().slice(6, 13)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
};
