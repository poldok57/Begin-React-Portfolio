const MARGE = 100;

export const getCanvasSize = (groundRef: HTMLDivElement) => {
  // search the most right and bottom element
  let maxWidth = 0;
  let maxHeight = 0;

  const children = groundRef.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as HTMLElement;
    if (child.tagName === "DIV") {
      const rect = child.getBoundingClientRect();
      const rightEdge = rect.left + rect.width;
      const bottomEdge = rect.top + rect.height;

      maxWidth = Math.max(maxWidth, rightEdge);
      maxHeight = Math.max(maxHeight, bottomEdge);
    }
  }

  return { width: maxWidth + MARGE, height: maxHeight + MARGE };
};

export const changeToucheMessage = (
  groundDiv: HTMLDivElement | null,
  idDiv: string
) => {
  if (groundDiv === null) {
    return;
  }

  const touchMessage = document.getElementById(idDiv);
  const isDocumentLargerThanWindow =
    groundDiv !== null &&
    (groundDiv.scrollHeight > groundDiv.offsetHeight ||
      groundDiv.scrollWidth > groundDiv.offsetWidth);

  if (touchMessage) {
    touchMessage.style.display = isDocumentLargerThanWindow ? "block" : "none";
  }

  // Effacer le message après 5 secondes
  if (isDocumentLargerThanWindow && isDocumentLargerThanWindow) {
    setTimeout(() => {
      if (touchMessage) {
        touchMessage.style.display = "none";
      }
    }, 4000);
  }
};
