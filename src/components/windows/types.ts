export type WindowStyle = {
  top: string;
  left: string;
  right: string;
  bottom: string;
  width: string;
  height: string;
  position: string;
  overflow: string;
  borderRadius: string;
  opacity: string;
  transition: string;
};

export type WindowType = {
  id: string;
  isMinimized: boolean;
  isMaximized: boolean;
  style: WindowStyle;
};
