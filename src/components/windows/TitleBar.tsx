import React, {
  forwardRef,
  MutableRefObject,
  ReactNode,
  useState,
  useEffect,
} from "react";

import { CloseButton } from "./CloseButton";
import { ToggleMinimize } from "./ToggleMinimize";
import { ToggleMaximize } from "./ToggleMaximize";
import { ToggleSwitch } from "../atom/ToggleSwitch";
import { WindowType } from "./types";
import { useWindowActions, useMaximizedWindowId } from "./store";
import { copyDivStyle, toggleWindowSize } from "./window-size";
import { useComponentSize } from "./WithResizing";
import { isTouchDevice } from "@/lib/utils/device";

import clsx from "clsx";

export enum STATUS {
  MINIMIZED = "minimized",
  MAXIMIZED = "maximized",
  OPEN = "open",
  CLOSED = "closed",
}

type Status = STATUS.MINIMIZED | STATUS.MAXIMIZED | STATUS.OPEN | STATUS.CLOSED;

interface TitleBarProps {
  id: string;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
  close?: boolean;
  onClose?: (() => void) | undefined;
  status?: Status;
  withMinimize?: boolean;
  withMaximize?: boolean;
  toggleLocked?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLocked?: boolean;
  referrer?: MutableRefObject<HTMLButtonElement | null | undefined>;
}

export const TitleBar = forwardRef<HTMLDivElement, TitleBarProps>(
  function TitleBar(
    {
      children = null,
      id,
      className,
      style,
      close,
      onClose = undefined,
      status = STATUS.OPEN,
      referrer,
      withMinimize = false,
      withMaximize = false,
      toggleLocked,
      isLocked = true,
      ...props
    },
    ref
  ) {
    const [currentStatus, setCurrentStatus] = useState<Status>(status);
    const {
      upsertWindow,
      getWindow,
      addMaximizedWindow,
      removeMaximizedWindow,
    } = useWindowActions();
    const { lockResize, hideComponent } = useComponentSize();

    const maximizeId = useMaximizedWindowId();

    const btnRef = referrer ? referrer.current : undefined;

    const btnSize = isTouchDevice() ? "xl" : "md";
    /**
     * Gère la fermeture de la fenêtre
     */
    const handleClose = () => {
      if (close) {
        hideComponent();
      }
      onClose && onClose();

      // Restore the scroll of the body if no window is maximized
      removeMaximizedWindow(id);

      if (maximizeId.length === 0) {
        document.body.style.overflow = "auto";
      }

      setCurrentStatus(STATUS.CLOSED);
    };
    /**
     * Minimize the window
     */
    const minimizeOn = () => {
      if (!(ref && "current" in ref && ref.current)) {
        return;
      }
      let win: WindowType | undefined = undefined;

      if (currentStatus === STATUS.MAXIMIZED) {
        // Window was maximized get the memoized window
        win = getWindow(id);
      } else {
        // memorize the window style and size
        win = copyDivStyle(ref.current.parentElement as HTMLElement, id);
      }
      if (!win) {
        return;
      }
      // insert in store
      win.isMinimized = true;
      win.isMaximized = currentStatus === STATUS.MAXIMIZED;
      win.isLocked = isLocked;
      win.title = children as string;
      win.bgColor = style?.backgroundColor || null;
      win.color = style?.color || null;
      win.toggleUp = minimizeOff;
      win.onClose = close ? hideComponent : undefined;

      upsertWindow(win);
      toggleWindowSize(ref.current.parentElement as HTMLDivElement, win);

      setCurrentStatus(STATUS.MINIMIZED);
    };

    const minimizeOff = () => {
      if (!(ref && "current" in ref && ref.current)) {
        return;
      }
      // get window in the store
      const win = getWindow(id);
      if (!win) {
        console.error("minimizeOff an unknown window");
        return;
      }
      win.isMinimized = false;

      upsertWindow(win);
      // window is maximized
      toggleWindowSize(ref.current.parentElement as HTMLDivElement, win);
      setCurrentStatus(win.isMaximized ? STATUS.MAXIMIZED : STATUS.OPEN);
    };

    const handleMinimize = () => {
      if (currentStatus === STATUS.MINIMIZED) {
        minimizeOff();
        return;
      }
      minimizeOn();
    };

    const maximizeOn = () => {
      if (!(ref && "current" in ref && ref.current)) {
        return;
      }
      let win: WindowType | undefined = undefined;
      if (currentStatus === STATUS.OPEN) {
        win = copyDivStyle(ref.current.parentElement as HTMLElement, id);
      } else {
        win = getWindow(id);
      }
      if (!win) {
        console.error("maximizeOn an unknown window");
        return;
      }
      win.isMaximized = true;
      win.isMinimized = false;
      upsertWindow(win);
      toggleWindowSize(ref.current.parentElement as HTMLDivElement, win);
      setCurrentStatus(STATUS.MAXIMIZED);
      lockResize(true);
    };

    const maximizeOff = () => {
      if (!(ref && "current" in ref && ref.current)) {
        return;
      }
      const win = getWindow(id);
      if (!win) {
        console.error("maximizeOff an unknown window");
        return;
      }

      win.isMaximized = false;
      win.isMinimized = false;
      upsertWindow(win);
      toggleWindowSize(ref.current.parentElement as HTMLDivElement, win);
      setCurrentStatus(STATUS.OPEN);
      lockResize(false);
    };

    const toggleMaximize = () => {
      if (currentStatus === STATUS.MAXIMIZED) {
        maximizeOff();
        return;
      }
      maximizeOn();
    };

    // controle the scroll bar of the body
    useEffect(() => {
      const windowClosed = () => {
        removeMaximizedWindow(id);
        if (maximizeId.length === 0) {
          document.body.style.overflow = "auto";
          document.body.style.transition = "overflow 0.5s";
        }
      };

      if (currentStatus === STATUS.MAXIMIZED) {
        addMaximizedWindow(id);
        document.body.style.overflow = "hidden";
        document.body.style.transition = "overflow 0.5s";
      } else {
        windowClosed();
      }

      return () => {
        windowClosed();
      };
    }, [currentStatus, id]);

    // handle clic on the opener button
    useEffect(() => {
      if (!btnRef) return;
      btnRef.addEventListener("mousedown", minimizeOff);
      return () => {
        btnRef.removeEventListener("mousedown", minimizeOff);
      };
    }, [btnRef]);

    // console.log(`render TitleBar -> [${id}] currentStatus`, currentStatus);
    return (
      <div
        ref={ref}
        className={clsx(
          "flex absolute top-0 left-0 items-center w-full",
          className
        )}
        style={style}
        {...props}
      >
        <div className="overflow-hidden self-center px-2 mx-auto text-nowrap text-ellipsis">
          {children}
        </div>
        <div
          className={clsx(
            "flex absolute flex-row gap-4 justify-between items-center p-1 w-full h-full",
            "opacity-20 group-hover/draggable:opacity-100"
          )}
        >
          <div>
            {toggleLocked && currentStatus !== STATUS.MAXIMIZED && (
              <ToggleSwitch
                defaultChecked={isLocked}
                onChange={toggleLocked}
                color="red"
                initialColor="green"
                className="z-40 mt-1 border-blue-600 cursor-pointer color-primary border2"
              />
            )}
          </div>
          <div className="flex flex-row gap-4 justify-end ml-auto lg:gap-2">
            {withMinimize || withMaximize ? (
              <>
                {withMinimize && (
                  <ToggleMinimize
                    isMinimized={false}
                    toggleMinimize={handleMinimize}
                    size={btnSize}
                  />
                )}
                {withMaximize && (
                  <ToggleMaximize
                    isMaximized={currentStatus === STATUS.MAXIMIZED}
                    toggleMaximize={toggleMaximize}
                    size={btnSize}
                  />
                )}
              </>
            ) : null}
            {close || onClose ? (
              <CloseButton onClick={handleClose} size={btnSize} />
            ) : null}
          </div>
        </div>
      </div>
    );
  }
);
