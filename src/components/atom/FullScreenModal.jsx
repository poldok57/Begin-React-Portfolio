import { forwardRef, useRef } from "react";
import { CloseButton } from "./CloseButton";
import { TitleBar } from "./TitleBar";
import { ToggleMinimize } from "./ToggleMinimize";
import clsx from "clsx";

const [DEFAULT_LEFT, DEFAULT_TOP] = ["5px", "2px"];
const [FRAME_WIDTH, FRAME_HEIGHT] = ["calc(100% - 10px)", "calc(100% - 5px)"];
const DEFAULT_OVERFLOW = "auto";

const TITLE_HEIGHT = 40;

const toggleMinimize = (minimize, ref = null) => {
  let left, top, width, height, bottom, overflow;

  if (minimize) {
    // Minimized state
    left = "1px";
    top = `${window.innerHeight - TITLE_HEIGHT}px`;
    width = "20%";
    height = `${TITLE_HEIGHT}px`;
    bottom = "0";
    overflow = "hidden";
  } else {
    // Maximized state
    left = DEFAULT_LEFT;
    top = DEFAULT_TOP;
    width = FRAME_WIDTH;
    height = FRAME_HEIGHT;
    bottom = "auto";
    overflow = DEFAULT_OVERFLOW;
  }

  if (ref && ref.current) {
    const style = ref.current.style;
    // Reset positions to transition smoothly from current to new state
    style.transition = "none"; // Disable transition for instant reset

    // Apply transitions
    setTimeout(() => {
      style.transition = "top 1.5s, left 1s, width 1s, height 1.5s";
      style.top = top;
      style.left = left;
      style.width = width;
      style.height = height;
      style.bottom = bottom;
      style.overflow = overflow;
      style.position = "fixed";
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
export const FullScreenModal = forwardRef(function FullScreenModal(
  { onClose, referrer = null, title = null, bgTitle = null, children },
  ref
) {
  // const titleBarRef = useRef(null);

  const rect =
    referrer && referrer.current
      ? referrer.current.getBoundingClientRect()
      : null;

  const frameMinimize = (minimize) => {
    toggleMinimize(minimize, ref);
  };
  const titleBarRef = useRef(null);
  const mStyle = {
    position: "fixed",
    overflow: "auto",
    left: DEFAULT_LEFT,
    top: DEFAULT_TOP,
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
  };
  if (rect) {
    mStyle.left = rect.left;
    mStyle.top = rect.top;
    mStyle.width = rect.width;
    mStyle.height = rect.height;
    mStyle.transition = "all 1.5s";

    setTimeout(() => {
      toggleMinimize(false, ref);
    }, 100);
  }
  return (
    <div
      ref={ref}
      className="z-40 rounded-lg border-2 border-red-700 bg-paper p-4 shadow-xl"
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
          backgroundColor: bgTitle,
        }}
      >
        {title}
        <div className="absolute top-1 right-3 mt-0 flex flex-row justify-end gap-4 pt-0">
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
});
