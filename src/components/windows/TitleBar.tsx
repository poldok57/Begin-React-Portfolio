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
import { copyDivStyle, toggleWindowSize } from "./window-size";

import clsx from "clsx";

interface TitleBarProps {
  id: string;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
  onClose?: () => void;
  maximize?: boolean;
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
      maximize = false,
      referrer,
      withMinimize = false,
      withMaximize = false,
      toggleLocked,
      isLocked = false,
      ...props
    },
    ref
  ) {
    const [isMinimized, setMinimized] = useState(false);
    const [isMaximized, setMaximized] = useState(maximize);
    const { upsertWindow, getWindow, removeWindow, setMaximize } =
      useWindowActions();
    const { maximizeId } = useWindowStore();

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
            win.isMaximized = isMaximized;
            upsertWindow(win);
          }
          toggleWindowSize(ref.current.parentElement as HTMLDivElement, win);
        } else {
          // get window in the store
          const win = getWindow(id);
          if (win) {
            win.isMinimized = false;
            setMaximized(win.isMaximized);
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
      console.log("isMaximized", isMaximized);
      console.log("isMinimized", isMinimized);
      if (isMaximized && !isMinimized) {
        setMaximize(id);
        document.body.style.overflow = "hidden";
        document.body.style.transition = "overflow 0.5s";
      }
      if (!isMaximized && maximizeId === id) {
        setMaximize("");
        document.body.style.overflow = "auto";
        document.body.style.transition = "overflow 0.5s";
      }

      return () => {
        document.body.style.overflow = "auto";
      };
    }, [isMinimized]);

    // handle clic on the opener button
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
        className={clsx("flex justify-center items-center p-1", className)}
        style={style}
        {...props}
      >
        <div className="overflow-hidden justify-self-center self-center p-1 text-nowrap text-ellipsis">
          {children}
        </div>
        <div
          onClick={handleMinimizeOff}
          className={clsx(
            "flex absolute flex-row gap-4 justify-between p-1 mt-0 w-full",
            "opacity-20 group-hover:opacity-95"
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
            {(withMinimize && !isMinimized) || withMaximize ? (
              <>
                {withMinimize && !isMinimized && (
                  <ToggleMinimize
                    isMinimized={isMinimized}
                    toggleMinimize={handleMinimize}
                  />
                )}
                {withMaximize && (
                  <ToggleMaximize
                    isMaximized={isMaximized}
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
