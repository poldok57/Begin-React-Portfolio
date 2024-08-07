import React, {
  forwardRef,
  MutableRefObject,
  ForwardedRef,
  useRef,
  useEffect,
} from "react";
import clsx from "clsx";

import { TitleBar, STATUS } from "./TitleBar";
import { WindowRect } from "./types";
import { toggleWindowSize, TITLE_HEIGHT, copyDivStyle } from "./window-size";

import { useWindowActions, generateRandomKey } from "./store";
import { getContrastColor } from "../../lib/utils/colors";
import { withMousePosition } from "./withMousePosition";

/**
 * FullScreenModal component
 * @param {object} props
 * @param {function} props.onClose  - function to close the modal
 * @param {object} props.referrer  - referrer object from button who has opened the modal
 * @param {string} props.title  - title of the modal
 * @param {string} props.bgTitle  - background color of the title bar
 * @param {ReactNode} props.children  - children of the modal
 */
interface FullScreenWindowProps {
  onClose: () => void;
  isOpen: boolean;
  referrer?: MutableRefObject<HTMLButtonElement | null>;
  title?: string;
  bgTitle?: string;
  withMinimize?: boolean;
  children: React.ReactNode;
}
export const FullScreenWindow = forwardRef<
  HTMLDivElement,
  FullScreenWindowProps
>(function FullScreenModal(
  {
    onClose,
    isOpen,
    referrer,
    title = null,
    bgTitle = null,
    withMinimize = false,
    children,
  },
  ref: ForwardedRef<HTMLDivElement>
) {
  const rect =
    referrer && referrer.current
      ? referrer.current.getBoundingClientRect()
      : null;

  const titleBarRef = useRef(null);
  const randomKey = useRef(generateRandomKey());
  const id = title ? title : randomKey.current;
  const { addWindow } = useWindowActions();

  const mStyle = useRef<WindowRect | null>(
    rect
      ? {
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
        }
      : null
  );

  useEffect(() => {
    if (!ref) return;
    if (isOpen == false) {
      if (rect) {
        mStyle.current = {
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
        };
      }
      return;
    }

    if ("current" in ref && ref.current) {
      toggleWindowSize(ref.current, undefined);
      const win = copyDivStyle(ref.current, id);
      if (win) {
        win.isMinimized = false;
        win.isMaximized = true;
        addWindow(win);
      }
      mStyle.current = {
        left: ref.current.style.left as string,
        top: ref.current.style.top as string,
        width: ref.current.style.width as string,
        height: ref.current.style.height as string,
      };
    }
  }, [ref, id, isOpen]);

  // console.log("FULLSCREEN render: ", id);

  // if (!isOpen) return null; // <div ref={ref}> Close !</div>;

  return (
    <div
      ref={ref}
      className={clsx(
        "z-20 p-4 rounded-lg border-2 border-red-700 shadow-xl bg-paper",
        {
          invisible: !isOpen,
        }
      )}
      style={mStyle.current as React.CSSProperties}
    >
      {isOpen && (
        <>
          <TitleBar
            id={id}
            className={clsx("group/draggable", {
              "text-lg rounded border border-gray-500 bg-primary text-paper":
                title,
            })}
            ref={titleBarRef}
            withMinimize={withMinimize}
            status={STATUS.MAXIMIZED}
            style={{
              height: TITLE_HEIGHT,
              ...(bgTitle
                ? {
                    backgroundColor: bgTitle,
                    color: getContrastColor(bgTitle),
                  }
                : {}),
            }}
            onClose={onClose}
            referrer={referrer}
          >
            {title}
          </TitleBar>
          <div
            className={clsx("absolute mx-0 my-2", {
              "mt-10": title,
            })}
            style={{ width: "calc(100% - 20px)" }}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
});

export const FullScreenWindowWP = withMousePosition(FullScreenWindow);
