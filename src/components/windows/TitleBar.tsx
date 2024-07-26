import React, {
  forwardRef,
  MutableRefObject,
  ReactNode,
  useState,
  useEffect,
} from "react";

import { CloseButton } from "../atom/CloseButton";
import { ToggleMinimize } from "../atom/ToggleMinimize";
import { ToggleMaximize } from "../atom/ToggleMaximize";
import { WindowType } from "./types";
import { useWindowActions } from "./store";
import { copyDivStyle, toggleWindowSize } from "./window-size";

import clsx from "clsx";

interface TitleBarProps {
  id: string;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
  onClose?: () => void;
  withMinimize?: boolean;
  withMaximize?: boolean;
  referrer?: MutableRefObject<HTMLButtonElement | null | undefined>;
}

export const TitleBar = forwardRef<HTMLDivElement, TitleBarProps>(
  function TitleBar(
    {
      children = null,
      id,
      className,
      style,
      onClose,
      referrer,
      withMinimize = false,
      withMaximize = false,
      ...props
    },
    ref
  ) {
    const [isMinimized, setMinimized] = useState(false);
    const [isMaximized, setMaximized] = useState(false);
    const { upsertWindow, getWindow, removeWindow } = useWindowActions();

    const btnRef = referrer ? referrer.current : undefined;

    const handleMinimize = () => {
      const minimize = !isMinimized;
      setMinimized(minimize);

      if (ref && "current" in ref && ref.current) {
        if (minimize) {
          // window is minimized
          // memorize the window style and size
          const win: WindowType | undefined = copyDivStyle(
            ref.current.parentElement as HTMLElement,
            id
          );
          if (win) {
            // insert in store
            win.isMinimized = true;
            upsertWindow(win);
          }
          toggleWindowSize(ref.current.parentElement as HTMLDivElement, win);
        } else {
          // get window in the store
          const win = getWindow(id);
          if (win) {
            win.isMinimized = false;
            upsertWindow(win);
          }
          // window is maximized
          toggleWindowSize(ref.current.parentElement as HTMLDivElement, win);
          removeWindow(id);
        }
      }
    };

    const handleMinimizeOff = () => {
      if (isMinimized) {
        handleMinimize();
      }
    };

    const toggleMaximize = () => {
      const maximize = !isMaximized;
      const win = getWindow(id);
      if (win) {
        win.isMaximized = maximize;
        upsertWindow(win);
        if (ref && "current" in ref && ref.current) {
          toggleWindowSize(ref.current.parentElement as HTMLDivElement, win);
        }
      }
      setMaximized(maximize);
    };

    const handleClose = () => {
      removeWindow(id);
      onClose && onClose();
    };

    useEffect(() => {
      const handleResize = () => {
        if (isMaximized && ref && "current" in ref && ref.current) {
          const win = getWindow(id);
          if (win) {
            toggleWindowSize(ref.current.parentElement as HTMLDivElement, win);
          }
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, [isMaximized, id]);

    useEffect(() => {
      if (isMinimized) {
        document.body.style.overflow = "auto";
        document.body.style.transition = "overflow 0.5s";
      } else {
        document.body.style.overflow = "hidden";
        document.body.style.transition = "overflow 0.5s";
      }

      return () => {
        document.body.style.overflow = "auto";
      };
    }, [isMinimized]);

    useEffect(() => {
      if (!btnRef) return;
      btnRef.addEventListener("mousedown", handleMinimizeOff);
      return () => {
        btnRef.removeEventListener("mousedown", handleMinimizeOff);
      };
    });

    return (
      <div
        ref={ref}
        className={clsx("flex justify-between items-center p-1", className)}
        style={style}
        {...props}
        onClick={handleMinimizeOff}
      >
        <div>{children}</div>
        <div
          className={clsx(
            "flex flex-row gap-4 justify-end pt-0 mt-0 lg:gap-3",
            "opacity-20 group-hover:opacity-95"
          )}
        >
          {withMinimize && !isMinimized ? (
            <ToggleMinimize
              isMinimized={isMinimized}
              toggleMinimize={handleMinimize}
            />
          ) : null}
          {withMaximize ? (
            <ToggleMaximize
              isMaximized={isMaximized}
              toggleMaximize={toggleMaximize}
            />
          ) : null}

          {onClose ? <CloseButton onClick={handleClose} /> : null}
        </div>
      </div>
    );
  }
);
