import React, {
  forwardRef,
  MutableRefObject,
  ForwardedRef,
  useRef,
} from "react";
import { CloseButton } from "./CloseButton";
import { TitleBar } from "./TitleBar";
import { ToggleMinimize } from "./ToggleMinimize";
import clsx from "clsx";

const [DEFAULT_LEFT, DEFAULT_TOP] = ["5px", "2px"];
const [FRAME_WIDTH, FRAME_HEIGHT] = ["calc(100% - 10px)", "calc(100% - 5px)"];
const DEFAULT_OVERFLOW = "auto";

const TITLE_HEIGHT = 40;
const DURATION_HORIZONTAL = 0.6;
const DURATION_VERTICAL = 0.5;

const toggleMinimize = (
  minimize: boolean,
  ref: MutableRefObject<HTMLDivElement> | null = null
) => {
  let left, top, width, height, bottom, overflow, cursor;

  if (minimize) {
    // Minimized state
    left = "1px";
    top = `${window.innerHeight - TITLE_HEIGHT}px`;
    width = "20%";
    height = `${TITLE_HEIGHT}px`;
    bottom = "0";
    overflow = "hidden";
    cursor = "pointer";
  } else {
    // Maximized state
    left = DEFAULT_LEFT;
    top = DEFAULT_TOP;
    width = FRAME_WIDTH;
    height = FRAME_HEIGHT;
    bottom = "auto";
    overflow = DEFAULT_OVERFLOW;
    cursor = "default";
  }

  if (ref && ref.current) {
    const style = ref.current.style;
    // Reset positions to transition smoothly from current to new state
    style.transition = "none"; // Disable transition for instant reset

    // Apply transitions
    setTimeout(() => {
      style.transition = `top ${DURATION_VERTICAL}s, ${DURATION_VERTICAL}s, width ${DURATION_HORIZONTAL}s, height ${DURATION_HORIZONTAL}s`;
      style.top = top;
      style.left = left;
      style.width = width;
      style.height = height;
      style.bottom = bottom;
      style.overflow = overflow;
      style.position = "fixed";
      style.cursor = cursor;
    }, 10); // Delay transitions to allow for reset
  }
};

/**
 * FullScreenModal component
 * @param {object} props
 * @param {function} props.onClose  - function to close the modal
 * @param {object} props.referrer  - referrer object from button who has opened the modal
 * @param {string} props.title  - title of the modal
 * @param {string} props.bgTitle  - background color of the title bar
 */

interface FullScreenModalProps {
  onClose: () => void;
  referrer?: MutableRefObject<HTMLButtonElement>;
  title?: string;
  bgTitle?: string;
  children: React.ReactNode;
}

export const FullScreenModal = forwardRef<HTMLDivElement, FullScreenModalProps>(
  function FullScreenModal(
    { onClose, referrer = null, title = null, bgTitle = null, children },
    ref: ForwardedRef<HTMLDivElement>
  ) {
    // const titleBarRef = useRef(null);

    const rect =
      referrer && referrer.current
        ? referrer.current.getBoundingClientRect()
        : null;

    // let isMinimized = false;

    const frameMinimize = (minimize: boolean) => {
      // console.log("frameMinimize", minimize);
      // isMinimized = minimize;
      toggleMinimize(minimize, ref as MutableRefObject<HTMLDivElement>);
    };
    const titleBarRef = useRef(null);
    const mStyle: React.CSSProperties = {
      position: "fixed",
      overflow: "auto",
      left: DEFAULT_LEFT,
      top: DEFAULT_TOP,
      width: FRAME_WIDTH,
      height: FRAME_HEIGHT,
      transition: "",
    };
    if (rect) {
      mStyle.left = `${rect.left}px`;
      mStyle.top = `${rect.top}px`;
      mStyle.width = `${rect.width}px`;
      mStyle.height = `${rect.height}px`;
      mStyle.transition = "all 0.5s";

      setTimeout(() => {
        toggleMinimize(false, ref as MutableRefObject<HTMLDivElement>);
      }, 100);
    }
    return (
      <div
        ref={ref}
        className="z-30 p-4 border-2 border-red-700 rounded-lg shadow-xl bg-paper"
        style={mStyle}
      >
        <TitleBar
          className={clsx("group", {
            "rounded border border-gray-500  bg-primary text-lg text-paper":
              title,
          })}
          ref={titleBarRef}
          style={{
            top: 0,
            left: 0,
            height: TITLE_HEIGHT,
            position: "absolute",
            width: "100%",
            ...(bgTitle ? { backgroundColor: bgTitle } : {}),
          }}
          // onClick={() => frameMinimize(false)}
        >
          {title}
          <div className="absolute flex flex-row justify-end gap-4 pt-0 mt-0 top-1 right-3">
            <ToggleMinimize referrer={referrer} frameMinimize={frameMinimize} />
            <CloseButton onClick={onClose} />
          </div>
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
  }
);
