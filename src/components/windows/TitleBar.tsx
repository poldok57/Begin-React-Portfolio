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
import { ToggleSwitch } from "../atom/ToggleSwitch";
import { WindowType } from "./types";
import { useWindowActions, useWindowStore } from "./store";
import { copyDivStyle, toggleWindowSize, TITLE_HEIGHT } from "./window-size";

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
      onClose,
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
    const { upsertWindow, getWindow, removeWindow, setMaximize } =
      useWindowActions();
    const { maximizeId } = useWindowStore();

    const btnRef = referrer ? referrer.current : undefined;
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
      win.onClose = onClose;

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

    const handleMinimizeOff = (e: MouseEvent) => {
      e.preventDefault();
      // console.log("handleMinimizeOff ", isMinimized);
      if (currentStatus === STATUS.MINIMIZED) {
        minimizeOff();
      }
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
    };

    const toggleMaximize = () => {
      if (currentStatus === STATUS.MAXIMIZED) {
        maximizeOff();
        return;
      }
      maximizeOn();
    };

    const handleClose = () => {
      removeWindow(id);
      onClose && onClose();
    };

    // controle the scroll bar of the body
    useEffect(() => {
      if (currentStatus === STATUS.MAXIMIZED) {
        setMaximize(id);
        document.body.style.overflow = "hidden";
        document.body.style.transition = "overflow 0.5s";
      } else if (maximizeId === id) {
        setMaximize("");
        document.body.style.overflow = "auto";
        document.body.style.transition = "overflow 0.5s";
      }

      return () => {
        document.body.style.overflow = "auto";
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

    if (currentStatus === STATUS.MINIMIZED) {
      if (style) {
        style = {
          ...style,
          transform: "none",
          visibility: "visible",
          opacity: "1",
          cursor: "pointer",
          height: `${TITLE_HEIGHT}px`,
        };
      }

      // title bar for minimized window
      return (
        <div
          ref={ref}
          className={clsx(
            className,
            "flex absolute top-0 left-0 items-center w-full",
            "visible opacity-100"
          )}
          style={style}
          onClick={(e: React.MouseEvent) => handleMinimizeOff(e.nativeEvent)}
          {...props}
        >
          <div className="overflow-hidden self-center px-1 mx-auto text-nowrap text-ellipsis">
            {children}
          </div>
          <div
            className={clsx(
              "flex absolute p-1 w-full",
              "opacity-20 group-hover/draggable:opacity-95"
            )}
          >
            <div className="flex flex-row gap-4 justify-end ml-auto lg:gap-2">
              {onClose ? <CloseButton onClick={handleClose} /> : null}
            </div>
          </div>
        </div>
      );
    }

    // title bar for window not minimized
    return (
      <div
        ref={ref}
        className={clsx(
          "flex absolute top-0 left-0 w-full :/items-center",
          className
        )}
        style={style}
        {...props}
      >
        <div className="overflow-hidden self-center px-1 mx-auto text-nowrap text-ellipsis">
          {children}
        </div>
        <div
          className={clsx(
            "flex absolute flex-row gap-4 justify-between items-center p-1 w-full",
            "opacity-20 group-hover/draggable:opacity-95"
          )}
        >
          <div>
            {toggleLocked && (
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
                  />
                )}
                {withMaximize && (
                  <ToggleMaximize
                    isMaximized={currentStatus === STATUS.MAXIMIZED}
                    toggleMaximize={toggleMaximize}
                  />
                )}
              </>
            ) : null}
            {onClose ? <CloseButton onClick={handleClose} /> : null}
          </div>
        </div>
      </div>
    );
  }
);
