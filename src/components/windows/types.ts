export type WindowRect = {
  top: string;
  left: string;
  width: string;
  height: string;
};

export type WindowStyle = WindowRect & {
  right: string;
  bottom: string;
  position: string;
  overflow: string;
  borderRadius: string;
  opacity: string;
  zIndex: string;
  transition: string;
};

export type WindowType = {
  id: string;
  title: string;
  bgColor: string | null;
  color: string | null;
  htmlDiv: HTMLDivElement | null;
  isMinimized: boolean;
  isMaximized: boolean;
  isLocked: boolean;
  toggleUp: () => void;
  onClose: (() => void) | undefined;
  style: WindowStyle;
};
