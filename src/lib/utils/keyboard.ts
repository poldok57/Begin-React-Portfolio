type EscapeKeyHandler = () => void;

export const addEscapeKeyListener = (handler: EscapeKeyHandler) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      handler();
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
};
