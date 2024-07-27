import React, {
  forwardRef,
  MutableRefObject,
  ForwardedRef,
  useRef,
  useEffect,
} from "react";
import clsx from "clsx";

import { TitleBar } from "./TitleBar";
import { toggleWindowSize, TITLE_HEIGHT } from "./window-size";

// import { useWindowActions } from "./store";
import { generateRandomKey } from "./store";
import { getContrastColor } from "../../lib/utils/colors";

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
  referrer?: MutableRefObject<HTMLButtonElement | null>;
  title?: string;
  bgTitle?: string;
  maximize?: boolean;
  withMinimize?: boolean;
  children: React.ReactNode;
}
export const FullScreenWindow = forwardRef<
  HTMLDivElement,
  FullScreenWindowProps
>(function FullScreenModal(
  {
    onClose,
    referrer,
    title = null,
    bgTitle = null,
    maximize,
    withMinimize = false,
    children,
  },
  ref: ForwardedRef<HTMLDivElement>
) {
  // const titleBarRef = useRef(null);

  const rect =
    referrer && referrer.current
      ? referrer.current.getBoundingClientRect()
      : null;

  const titleBarRef = useRef(null);
  const randomKey = useRef(generateRandomKey());
  const id = title ? title : randomKey.current;
  // const { getWindow } = useWindowActions();

  const mStyle: React.CSSProperties = {
    transition: "all 0.5s",
  };
  if (rect) {
    // set the position of the window to the position of the referrer (button who has opened the window)
    mStyle.left = `${rect.left}px`;
    mStyle.top = `${rect.top}px`;
    mStyle.width = `${rect.width}px`;
    mStyle.height = `${rect.height}px`;
  }

  useEffect(() => {
    if (!rect || !ref) return;
    if ("current" in ref && ref.current) {
      // const win = getWindow(id);
      // console.log("useEffect -> toogle Up, Win", win);
      // if (win) win.isMinimized = false;
      toggleWindowSize(ref.current, undefined);
    }
  }, [ref, id]);

  return (
    <div
      ref={ref}
      className="z-20 p-4 rounded-lg border-2 border-red-700 shadow-xl bg-paper"
      style={mStyle}
    >
      <TitleBar
        id={id}
        className={clsx("group", {
          "text-lg rounded border border-gray-500 bg-primary text-paper": title,
        })}
        ref={titleBarRef}
        withMinimize={withMinimize}
        maximize={maximize}
        style={{
          top: 0,
          left: 0,
          height: TITLE_HEIGHT,
          position: "absolute",
          width: "100%",
          ...(bgTitle
            ? { backgroundColor: bgTitle, color: getContrastColor(bgTitle) }
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
    </div>
  );
});
