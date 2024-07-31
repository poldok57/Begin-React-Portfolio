export const isAlignedRight = (
  style: CSSStyleDeclaration,
  cssStyle: CSSStyleDeclaration
): boolean => {
  if (cssStyle.position !== "fixed") return false;
  if (cssStyle.right && cssStyle.right !== "auto") return true;
  if (style.right && style.right !== "auto") return true;

  return false;
};

export const isAlignedBottom = (
  style: CSSStyleDeclaration,
  cssStyle: CSSStyleDeclaration
): boolean => {
  if (cssStyle.position !== "fixed") return false;
  if (cssStyle.bottom && cssStyle.bottom !== "auto") return true;
  if (style.bottom && style.bottom !== "auto") return true;

  return false;
};
