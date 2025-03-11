import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  MutableRefObject,
} from "react";
import { useDebounce } from "@/hooks/useDebounce";
// import { getRectOffset } from "../../lib/mouse-position";
import { MoveDiagonal2 } from "lucide-react";
import {
  BORDER,
  MARGIN_ON_BORDER,
  mouseIsOnBorderRect,
  mousePointer,
  isBorder,
  isBorderRightOrBottom,
  isBorderLeft,
  isBorderRight,
  isBorderTop,
  isBorderBottom,
  resizeRect,
  mouseDistanceFromBorder,
} from "../../lib/mouse-position";

import { SizeDisplay } from "./SizeDisplay";
import { isTouchDevice } from "@/lib/utils/device";

import { Size, Rectangle, Coordinate } from "../../lib/canvas/types";
import { EVENT, POSITION } from "./types";
import { cn } from "@/lib/utils/cn";

interface ComponentSizeContext {
  componentSize: Size;
  lockResize: (lock: boolean) => void;
  resizeComponent: (size: Size) => Size;
  setMinimumSize: (size: Size) => void;
  setComponentSize: (size: Size) => void;
  hideComponent: () => void;
  showComponent: () => void;
  setRatio: (ratio: number) => void;
}
const DEFAULT_SIZE_MIN = { width: 100, height: 60 };

const SizeContext = createContext<ComponentSizeContext | null>(null);

interface WithResizingProps {
  isLocked?: boolean;
  resizable?: boolean;
  trace?: boolean;
  setResizing?: (resizing: boolean) => void | null;
  componentRef: MutableRefObject<HTMLElement | null>;
  componentName?: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  keepRatio?: boolean;
  children: React.ReactNode;
}
export const WithResizing: React.FC<WithResizingProps> = ({
  isLocked = true,
  resizable = true,
  trace = false,
  setResizing = null,
  componentRef,
  componentName = "WithResizing",
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  aspectRatio,
  children,
  keepRatio = false,
}) => {
  const memoDisplayRef = useRef("");

  const isAlignedRightRef = useRef(false);
  const isAlignedBottomRef = useRef(false);

  const isResizable = useRef(resizable);
  const minimumSize = useRef({ ...DEFAULT_SIZE_MIN });
  const [componentSize, setComponentSize] = useState<Size>(DEFAULT_SIZE_MIN);
  const memoResizable = resizable;
  const borderResizeRef = useRef("");
  const memoBorder = useRef("");
  const memoBackground = useRef("");
  const lastTap = useRef<number | null>(null);

  const aspectRatioRef = useRef(aspectRatio);
  // const keepRatio = props.keepRatio;
  // Initial position and distance for resizing with touch screen
  const initialArea = useRef({
    width: componentRef.current?.offsetWidth || 0,
    height: componentRef.current?.offsetHeight || 0,
    left: componentRef.current?.offsetLeft || 0,
    top: componentRef.current?.offsetTop || 0,
  });
  const initialDistance = useRef(0);

  const selectComponent = (): { component: HTMLElement | null } => {
    return {
      component: componentRef?.current || null,
    };
  };

  const hideComponent = () => {
    const { component } = selectComponent();
    if (component) {
      component.style.display = "none";
    }
  };

  const showComponent = () => {
    const { component } = selectComponent();
    if (component) {
      component.style.display = memoDisplayRef.current;
    }
  };

  const lockResize = (lock: boolean) => {
    if (lock) {
      isResizable.current = false;
    } else {
      isResizable.current = memoResizable;
    }
  };

  const updateComponentSize = () => {
    const { component } = selectComponent();
    if (component) {
      const rect = component.getBoundingClientRect();
      if (trace)
        console.log(
          `${componentName} set size: ${rect.width} x ${rect.height} minimum: ${minimumSize.current.width} x ${minimumSize.current.height}`
        );
      setComponentSize({
        width: Math.max(minimumSize.current.width, rect.width),
        height: Math.max(minimumSize.current.height, rect.height),
      });
    }
  };

  const controlRatioLimits = (newWidth: number, newHeight: number) => {
    if (!keepRatio || !aspectRatioRef.current) {
      // resize without aspect ratio
      if (maxWidth && newWidth > maxWidth) newWidth = maxWidth;
      if (maxHeight && newHeight > maxHeight) newHeight = maxHeight;

      return {
        width: newWidth,
        height: newHeight,
      };
    }

    // resize with aspect ratio
    const ratio = aspectRatioRef.current;
    if (maxWidth && newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / ratio;
    } else if (newWidth < minimumSize.current.width) {
      newWidth = minimumSize.current.width;
      newHeight = newWidth / ratio;
    } else {
      newHeight = newWidth / ratio;
    }
    if (maxHeight && newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * ratio;
    } else if (newHeight < minimumSize.current.height) {
      newHeight = minimumSize.current.height;
      newWidth = newHeight * ratio;
    }

    return { width: newWidth, height: newHeight };
  };

  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  const resizeComponent = (size: Size | Rectangle) => {
    const { component } = selectComponent();
    if (!component) {
      console.log(`${componentName} resizeComponent: component not found`);
      return size;
    }
    const rect = component.getBoundingClientRect();

    // first call, set the aspect ratio
    if (!aspectRatioRef.current && keepRatio) {
      aspectRatioRef.current = rect.width / rect.height;
      if (trace)
        console.log(
          `${componentName} resizeComponent: aspect ratio: ${aspectRatioRef.current}`
        );
    }

    if (trace)
      console.log(
        `${componentName} resizeComponent: size: ${size.width} x ${size.height} rect: ${rect.width} x ${rect.height} minimum: ${minimumSize.current.width} x ${minimumSize.current.height} ratio: ${aspectRatioRef.current} keepRatio: ${keepRatio}`
      );

    let newWidth = size.width ?? rect.width;
    let newHeight = size.height ?? rect.height;
    newWidth = Math.max(newWidth, minimumSize.current.width);
    newHeight = Math.max(newHeight, minimumSize.current.height);

    if (!keepRatio || !aspectRatioRef.current) {
      // resize without aspect ratio
      if (maxWidth && newWidth > maxWidth) newWidth = maxWidth;
      if (maxHeight && newHeight > maxHeight) newHeight = maxHeight;

      if (size.width !== undefined) component.style.width = newWidth + "px";
      if (size.height !== undefined) component.style.height = newHeight + "px";

      return {
        width: newWidth,
        height: newHeight,
      };
    }

    // resize with aspect ratio
    if (typeof size.width === "undefined") {
      newWidth = newHeight * aspectRatioRef.current;
    } else if (typeof size.height === "undefined") {
      newHeight = size.width / aspectRatioRef.current;
    }
    const newSize: Size = controlRatioLimits(newWidth, newHeight);

    component.style.width = newSize.width + "px";
    component.style.height = newSize.height + "px";

    return newSize;
  };

  const setMinimumSize = (size: Size | null = null) => {
    if (trace) console.log(`${componentName} Set MINIMUM SIZE`);

    if (size == null) {
      const { component } = selectComponent();
      if (component) {
        const rect = component.getBoundingClientRect();
        minimumSize.current.width = rect.width;
        minimumSize.current.height = rect.height;
        if (trace)
          console.log(
            `${componentName} Auto-set minimum size: ${rect.width} x ${rect.height}`
          );
      }
    } else {
      if (size.width !== undefined) minimumSize.current.width = size.width;
      if (size.height !== undefined) minimumSize.current.height = size.height;
      if (trace)
        console.log(
          `${componentName} Set minimum size: ${size.width} x ${size.height}`
        );
    }
  };

  const setRatio = (ratio: number) => {
    if (trace)
      console.log(
        `${componentName} Set ratio: ${ratio} keepRatio: ${keepRatio}`
      );
    aspectRatioRef.current = ratio;
  };

  const setResizeOn = () => {
    const { component } = selectComponent();
    if (component) {
      component.style.cursor = "nwse-resize";
    }
    borderResizeRef.current = BORDER.CORNER.BOTTOM_RIGHT;
  };

  const borderEffect = (component: HTMLElement) => {
    // Ajout d'un effet de bordure au composant
    component.style.border = "2px dotted red";
    component.style.background = "lightgray";
    component.style.transition =
      "border 0.3s ease-out, background 0.3s ease-out";
  };
  const borderEffectStop = (component: HTMLElement) => {
    setTimeout(() => {
      component.style.transition = "border 5s ease-out, background 4s ease-out";
      component.style.border = memoBorder.current;
      component.style.background = memoBackground.current;
    }, 1000);

    setTimeout(() => {
      component.style.transition = "";
    }, 5000);
  };

  const getComponentPositions = (component: HTMLElement) => {
    const style = getComputedStyle(component);
    return {
      position: style.position,
      rect: component.getBoundingClientRect(),
    };
  };

  const changeAlign = (component: HTMLElement, mousePos: string) => {
    const windowWidth = document.documentElement.clientWidth;
    const windowHeight = document.documentElement.clientHeight;

    if (isBorderLeft(mousePos) && !isAlignedRightRef.current) {
      // Left border on component align to the left
      const parentWidth =
        component.offsetParent?.getBoundingClientRect().right || windowWidth;
      const { position, rect } = getComponentPositions(component);

      const right =
        position === POSITION.FIXED
          ? windowWidth - rect.right
          : parentWidth - rect.right;

      if (trace)
        console.log(
          `[${componentName}] --- Change-Align: position: ${position} width: ${
            position === POSITION.FIXED ? parentWidth : windowWidth
          } - rect.right: ${rect.right} = ${right}px`
        );
      component.style.right = `${right}px`;
      component.style.left = "auto";

      if (trace)
        console.log(
          `[${componentName}] -i--- Change-Align: left: ${component.style.left} right: ${component.style.right} width: ${component.style.width}`
        );
    } else if (isBorderRight(mousePos) && isAlignedRightRef.current) {
      // Right border on component align to the right
      const parentWidth =
        component.offsetParent?.getBoundingClientRect().right || windowWidth;
      const { position, rect } = getComponentPositions(component);

      const left =
        position === POSITION.FIXED
          ? rect.left
          : rect.left - (parentWidth - windowWidth);

      if (trace)
        console.log(
          `[${componentName}] --- Change-Align: position: ${position} width: ${
            position === POSITION.FIXED ? parentWidth : windowWidth
          } - rect.left: ${rect.left} = ${left}px`
        );

      component.style.left = `${left}px`;
      component.style.right = "auto";

      if (trace)
        console.log(
          `[${componentName}] ---- Change-Align: left: ${component.style.left} right: ${component.style.right} width: ${component.style.width}`
        );
    }

    if (isBorderTop(mousePos) && !isAlignedBottomRef.current) {
      // Top border on component align to the top
      const parentHeight =
        component.offsetParent?.getBoundingClientRect().bottom || windowHeight;
      const { position, rect } = getComponentPositions(component);

      const bottom =
        position === POSITION.FIXED
          ? windowHeight - rect.bottom
          : parentHeight - rect.bottom;

      if (trace)
        console.log(
          `[${componentName}] --- Change-Align: position: ${position} height: ${
            position === POSITION.FIXED ? parentHeight : windowHeight
          } - rect.bottom: ${rect.bottom} = ${bottom}px`
        );

      component.style.top = "auto";
      component.style.bottom = `${bottom}px`;
    } else if (isBorderBottom(mousePos) && isAlignedBottomRef.current) {
      // Bottom border on component align to the bottom
      const parentHeight =
        component.offsetParent?.getBoundingClientRect().bottom || windowHeight;
      const { position, rect } = getComponentPositions(component);

      const top =
        position === POSITION.FIXED
          ? rect.top
          : rect.top - (parentHeight - windowHeight);

      if (trace)
        console.log(
          `[${componentName}] --- Change-Align: position: ${position} height: ${
            position === POSITION.FIXED ? parentHeight : windowHeight
          } - rect.top: ${rect.top} = ${top}px`
        );

      component.style.top = `${top}px`;
      component.style.bottom = "auto";

      if (trace)
        console.log(
          `[${componentName}] ---- Change-Align: top: ${component.style.top} bottom: ${component.style.bottom} height: ${component.style.height}`
        );
    }
  };

  const restoreAlign = (component: HTMLElement, mousePos: string) => {
    setTimeout(() => {
      if (isBorderLeft(mousePos) && !isAlignedRightRef.current) {
        component.style.left = `${component.offsetLeft}px`;
        component.style.right = "auto";
      }
      if (isBorderRight(mousePos) && isAlignedRightRef.current) {
        const parentWidth =
          component.offsetParent?.getBoundingClientRect().right ||
          window.innerWidth;
        const right =
          parentWidth - component.offsetLeft - component.offsetWidth;
        component.style.right = `${right}px`;
        component.style.left = "auto";
      }
      if (isBorderTop(mousePos) && !isAlignedBottomRef.current) {
        component.style.top = `${component.offsetTop}px`;
        component.style.bottom = "auto";
      }
      if (isBorderBottom(mousePos) && isAlignedBottomRef.current) {
        const parentHeight =
          component.offsetParent?.getBoundingClientRect().bottom ||
          window.innerHeight;
        const bottom =
          parentHeight - component.offsetTop - component.offsetHeight;
        component.style.bottom = `${bottom}px`;
        component.style.top = "auto";
      }
    }, 0);
  };

  // Set the initial alignment
  useEffect(() => {
    const { component } = selectComponent();
    if (!component) return;
    memoBorder.current = component.style.border;
    memoBackground.current = component.style.background;

    const style = getComputedStyle(component);

    isAlignedRightRef.current =
      style.position === POSITION.FIXED &&
      style.right !== "" &&
      style.right !== "auto";

    isAlignedBottomRef.current =
      style.position === POSITION.FIXED &&
      style.bottom !== "" &&
      style.bottom !== "auto";

    if (minWidth) minimumSize.current.width = minWidth;
    if (minHeight) minimumSize.current.height = minHeight;
    if (typeof window !== "undefined") {
      if (!maxWidth) maxWidth = window.innerWidth;
      if (!maxHeight) maxHeight = window.innerHeight;
    }

    if (trace) {
      console.log(
        `${componentName} Set initial alignment: ${style.position} ${style.right} ${style.bottom}`
      );
      console.log(
        "----- mminimum size",
        minimumSize.current,
        ` - max: ${maxWidth} x ${maxHeight}`
      );
    }
  }, []);

  // Check resizing of the component
  useEffect(() => {
    const { component } = selectComponent();
    if (!component) return;

    updateComponentSize();

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0) return;
      updateComponentSize();
    });
    resizeObserver.observe(component);

    window.addEventListener("resize", updateComponentSize);
    return () => {
      window.removeEventListener("resize", updateComponentSize);
    };
  }, [isResizable.current]);

  const debouncedConsoleLog = useDebounce(
    (componentName: string, message: string, coord: Coordinate) => {
      console.log(componentName, message, coord);
    },
    200
  );

  /**
   * Event for resize the component
   */
  useEffect(() => {
    const { component } = selectComponent();
    if (!isResizable.current || !component) {
      return;
    }

    const restoreRatio = () => {
      if (!aspectRatioRef.current) {
        return;
      }
      const rect = component.getBoundingClientRect();
      const diffWidth = Math.abs(rect.width - componentSize.width);
      const diffHeight = Math.abs(rect.height - componentSize.height);
      let newWidth = rect.width;
      let newHeight = rect.height;
      if (diffWidth < diffHeight) {
        newHeight = newWidth * aspectRatioRef.current;
      } else {
        newWidth = newHeight * aspectRatioRef.current;
      }

      const newSize = resizeComponent({
        width: newWidth,
        height: newHeight,
      });
      setComponentSize(newSize);
    };

    const extendMouseMove = () => {
      document.addEventListener(EVENT.MOUSE_MOVE, handleResize);
      component.removeEventListener(EVENT.MOUSE_MOVE, handleResize);
      // document.addEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
      // component.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
    };
    const extendMouseMoveStop = () => {
      if (trace) console.log(`[${componentName}] extendMouseMoveStop`);
      document.removeEventListener(EVENT.MOUSE_MOVE, handleResize);
    };

    // if component is locked, only resize on the right or bottom border
    const isOnABorder = (mousePos: string) => {
      return isLocked ? isBorderRightOrBottom(mousePos) : isBorder(mousePos);
    };

    const handleResizingStart = (coord: Coordinate) => {
      const rect = component.getBoundingClientRect();

      const mousePos = mouseIsOnBorderRect(coord, rect);

      if (mousePos && isResizable.current) {
        if (isOnABorder(mousePos)) {
          borderResizeRef.current = mousePos;
          const mouseCursor = mousePointer(mousePos);

          if (setResizing) setResizing(true);
          if (trace)
            console.log(
              `[${componentName}] resize Component Start : ${mousePos}`
            );
          component.style.cursor = mouseCursor;
          extendMouseMove();

          changeAlign(component, mousePos);
          borderEffect(component);
          return mouseCursor;
        }
        return null;
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      const mouseCursor = handleResizingStart({
        x: event.clientX,
        y: event.clientY,
      });
      if (mouseCursor) {
        event.preventDefault();
        component.style.cursor = mouseCursor;
      } else {
        component.style.cursor = "default";
      }
    };

    const handleResize = (event: MouseEvent) => {
      const rect = component.getBoundingClientRect();
      const mouseCoord: Coordinate = { x: event.clientX, y: event.clientY };

      if (trace) {
        debouncedConsoleLog(componentName, "handleResize ? ", mouseCoord);
      }

      const mousePos =
        borderResizeRef.current !== ""
          ? borderResizeRef.current
          : mouseIsOnBorderRect(mouseCoord, rect);

      if (!mousePos || !isResizable.current) {
        // mouse is not in the component
        const distance = mouseDistanceFromBorder(mouseCoord, rect);
        if (distance > MARGIN_ON_BORDER) {
          extendMouseMoveStop();
        }
        return false;
      }

      // mouse is on a valid border
      if (isOnABorder(mousePos)) {
        if (borderResizeRef.current !== "" && event.buttons === 1) {
          const newRect = resizeRect(mouseCoord, rect, mousePos, false);

          if (trace) {
            console.log(
              `[${componentName}] resize Component: ${mousePos}: `,
              newRect
            );
          }

          const newSize = resizeComponent(newRect as Size);
          setComponentSize(newSize);
        }
        component.style.cursor = mousePointer(mousePos);
        return true;
      }
      if (isLocked) {
        component.style.cursor = "default";
      } else {
        component.style.cursor = "move";
      }
      return false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (event.buttons === 1) {
        if (handleResize(event)) {
          event.preventDefault();
        }
      } else if (borderResizeRef.current !== "") {
        handleResizingStop(event, "mouseMove");
      }
    };

    const handleResizingStop = (e: MouseEvent, origine = "mouseUp") => {
      if (!borderResizeRef.current) return;

      restoreAlign(component, borderResizeRef.current);
      borderResizeRef.current = "";
      extendMouseMoveStop();
      borderEffectStop(component);
      if (setResizing) setResizing(false);

      if (trace && componentRef.current)
        console.log(`[${componentName}] resize stop, ${origine}`);
      component.style.cursor = "default";
      component.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (!isResizable.current) return;

      if (event.touches.length === 1) {
        const touch = event.touches[0];
        const cursor = handleResizingStart({
          x: touch.clientX,
          y: touch.clientY,
        });
        if (cursor) {
          console.log(`[${componentName}] touchStart preventDefault`);
          event.preventDefault();
        }
      } else if (event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.sqrt(
          (touch1.clientX - touch2.clientX) ** 2 +
            (touch1.clientY - touch2.clientY) ** 2
        );
        initialDistance.current = distance;
        const rect = component.getBoundingClientRect();
        initialArea.current = {
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top,
        };
      }
      component.addEventListener(EVENT.TOUCH_MOVE, handleTouchMove);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isResizable.current) return;

      if (event.touches.length === 1) {
        const touch = event.touches[0];
        const mouseEvent = new MouseEvent("mousemove", {
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
        if (handleResize(mouseEvent)) {
          event.preventDefault();
        }
      }
      if (event.touches.length === 2 && initialDistance.current) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.sqrt(
          (touch1.clientX - touch2.clientX) ** 2 +
            (touch1.clientY - touch2.clientY) ** 2
        );

        const scale = distance / initialDistance.current;

        const width = initialArea.current.width * scale;
        const height = initialArea.current.height * scale;

        const newSize1: Size = controlRatioLimits(width, height);

        const newSize: Size = resizeComponent(newSize1);
        setComponentSize(newSize);
        if (isLocked) {
          // dont move the component, when is locked
          return;
        }
        event.preventDefault();

        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;

        const newLeft = centerX - newSize.width / 2;
        const newTop = centerY - newSize.height / 2;

        component.style.left = `${newLeft}px`;
        component.style.top = `${newTop}px`;
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches;
      if (touch.length === 1) {
        const mouseEvent = new MouseEvent("mouseup", {
          clientX: touch[0].clientX,
          clientY: touch[0].clientY,
        });

        handleResizingStop(mouseEvent, "touchEnd");
      } else if (touch.length === 2 && initialDistance.current) {
        const newSize = resizeComponent(initialArea.current);
        setComponentSize(newSize);
        initialDistance.current = 0;
      }
      component.removeEventListener(EVENT.TOUCH_MOVE, handleTouchMove);
    };

    const handleDoubleClick = (event: MouseEvent) => {
      if (event.detail === 2) {
        restoreRatio();
      }
    };
    const handleDoubleTap = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        const now = new Date().getTime();
        const timeSince = now - (lastTap.current || 0);
        lastTap.current = now;

        if (timeSince < 600 && timeSince > 0) {
          if (aspectRatioRef.current) {
            restoreRatio();
          }
        }
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      // Activer le mouseover
      if (e.target === component) {
        extendMouseMove();
      }
    };

    component.addEventListener(EVENT.MOUSE_ENTER, handleMouseEnter);

    /**
     * add the events listener
     */
    component.addEventListener(EVENT.MOUSE_DOWN, handleMouseDown);
    document.addEventListener(EVENT.MOUSE_UP, handleResizingStop);
    component.addEventListener(EVENT.MOUSE_DBL_CLICK, handleDoubleClick);

    component.addEventListener(EVENT.TOUCH_START, handleTouchStart);
    document.addEventListener(EVENT.TOUCH_END, handleTouchEnd);
    document.addEventListener(EVENT.TOUCH_CANCEL, handleTouchEnd);
    component.addEventListener(EVENT.TOUCH_START, handleDoubleTap);

    return () => {
      component.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
      component.removeEventListener(EVENT.MOUSE_DOWN, handleMouseDown);
      document.removeEventListener(EVENT.MOUSE_UP, handleResizingStop);
      component.removeEventListener(EVENT.MOUSE_DBL_CLICK, handleDoubleClick);
      component.removeEventListener(EVENT.TOUCH_START, handleTouchStart);
      component.removeEventListener(EVENT.TOUCH_MOVE, handleTouchMove);
      document.removeEventListener(EVENT.TOUCH_END, handleTouchEnd);
      document.removeEventListener(EVENT.TOUCH_CANCEL, handleTouchEnd);
      component.removeEventListener(EVENT.TOUCH_START, handleDoubleTap);
      component.removeEventListener(EVENT.MOUSE_ENTER, handleMouseEnter);
    };
  }, [isResizable.current, isLocked]);

  return (
    <SizeContext.Provider
      value={{
        componentSize,
        resizeComponent,
        setComponentSize,
        setMinimumSize,
        hideComponent,
        showComponent,
        lockResize,
        setRatio,
      }}
    >
      <SizeDisplay size={componentSize} />
      {children}

      {isResizable.current && (
        <button
          className={cn([
            "absolute -right-2 -bottom-2 p-1 text-gray-700 bg-gray-300 rounded-xl",
            "opacity-0 group-hover/resizable:opacity-40 hover:opacity-80 cursor-nw-resize group-focus/resizable:opacity-60",
          ])}
          onClick={setResizeOn}
        >
          <MoveDiagonal2 size={isTouch ? 20 : 14} />
        </button>
      )}
    </SizeContext.Provider>
  );
};

// export the context for the component size
export const useComponentSize = () => {
  const context = useContext(SizeContext);
  if (!context) {
    throw new Error("useComponentSize must be used within a SizeProvider");
  }
  return context;
};
