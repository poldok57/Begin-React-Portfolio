import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  MutableRefObject,
} from "react";

// import { getRectOffset } from "../../lib/mouse-position";
import { MoveDiagonal2 } from "lucide-react";
import {
  BORDER,
  mouseIsOnBorderRect,
  mousePointer,
  isBorder,
  isBorderRightOrBottom,
  isBorderLeft,
  isBorderRight,
  isBorderTop,
  isBorderBottom,
  resizeRect,
} from "../../lib/mouse-position";

// import clsx from "clsx";

import { Size, Rectangle, Coordinate } from "../../lib/canvas/types";
import { EVENT, POSITION } from "./types";

interface ComponentSizeContext {
  componentSize: Size;
  lockResize: (lock: boolean) => void;
  resizeComponent: (size: Size) => void;
  setMinimumSize: (size: Size) => void;
  hideComponent: () => void;
  showComponent: () => void;
}
const DEFAULT_SIZE_MIN = { width: 100, height: 60 };

const SizeContext = createContext<ComponentSizeContext | null>(null);

interface WithResizingProps {
  isLocked?: boolean;
  resizable?: boolean;
  trace?: boolean;
  setResizing?: (resizing: boolean) => void | null;
  componentRef: MutableRefObject<HTMLElement | null>;
  children: React.ReactNode;
}
export const WithResizing: React.FC<WithResizingProps> = ({
  isLocked = true,
  resizable = true,
  trace = false,
  setResizing = null,
  componentRef,
  children,
}) => {
  // const offsetRef = useRef({ x: 0, y: 0 }); // for the difference between the mouse and the component
  const memoDisplayRef = useRef("");

  const isAlignedRightRef = useRef(false);
  const isAlignedBottomRef = useRef(false);

  const isResizable = useRef(resizable);
  const minimumSize = useRef(DEFAULT_SIZE_MIN);
  const [componentSize, setComponentSize] = useState<Size>(DEFAULT_SIZE_MIN);
  const memoResizable = resizable;
  const borderResizeRef = useRef("");
  const memoBorder = useRef("");
  const memoBackground = useRef("");

  const componentName = componentRef.current?.id || "WithResizing";

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
      setComponentSize({
        width: Math.max(minimumSize.current.width, rect.width),
        height: Math.max(minimumSize.current.height, rect.height),
      });
      if (trace)
        console.log(
          `${componentName} set size: ${rect.width} x ${rect.height}`
        );
    }
  };
  const resizeComponent = (size: Size | Rectangle) => {
    const { component } = selectComponent();
    if (component) {
      // component.style.width = !size.width ? "auto" : size.width + "px";
      // component.style.height = !size.height ? "auto" : size.height + "px";
      if (size.width !== undefined)
        component.style.width =
          Math.max(size.width, minimumSize.current.width) + "px";
      if (size.height !== undefined)
        component.style.height =
          Math.max(size.height, minimumSize.current.height) + "px";
    }
  };

  const setMinimumSize = (size: Size) => {
    if (size.width !== undefined) minimumSize.current.width = size.width;
    if (size.height !== undefined) minimumSize.current.height = size.height;
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

  /**
   * Event for resize the component
   */
  useEffect(() => {
    const { component } = selectComponent();
    if (!isResizable.current || !component) {
      return;
    }
    const extendMouseMove = () => {
      document.addEventListener(EVENT.MOUSE_MOVE, handleResizing);
      component.removeEventListener(EVENT.MOUSE_MOVE, handleResizing);
    };
    const extendMouseMoveStop = () => {
      document.removeEventListener(EVENT.MOUSE_MOVE, handleResizing);
      component.addEventListener(EVENT.MOUSE_MOVE, handleResizing);
    };
    const handleResizingStart = (event: MouseEvent) => {
      const rect = component.getBoundingClientRect();
      const mouseCoord: Coordinate = { x: event.clientX, y: event.clientY };

      // setMouseCoordinates(event.clientX, event.clientY);
      const mousePos = mouseIsOnBorderRect(mouseCoord, rect);

      if (mousePos && isResizable.current) {
        const mouseCursor = mousePointer(mousePos);
        if (isLocked ? isBorderRightOrBottom(mousePos) : isBorder(mousePos)) {
          borderResizeRef.current = mousePos;
          // offsetRef.current = getRectOffset(
          //   { x: event.clientX, y: event.clientY },
          //   {
          //     left: component.offsetLeft,
          //     top: component.offsetTop,
          //   }
          // );
          event.preventDefault();
          if (setResizing) setResizing(true);
          if (trace)
            console.log(
              `[${componentName}] resize Component Start : ${mousePos}`
            );
          component.style.cursor = mouseCursor;
          extendMouseMove();

          changeAlign(component, mousePos);
          borderEffect(component);
        } else {
          component.style.cursor = "default";
        }
      }
    };
    const handleResizing = (event: MouseEvent) => {
      const rect = component.getBoundingClientRect();
      const mouseCoord: Coordinate = { x: event.clientX, y: event.clientY };

      if (event.buttons !== 1 && borderResizeRef.current !== "") {
        handleResizingStop(event, "mouseMove");
      }

      const mousePos =
        borderResizeRef.current !== ""
          ? borderResizeRef.current
          : mouseIsOnBorderRect(mouseCoord, rect);

      if (mousePos && isResizable.current) {
        const mouseCursor = mousePointer(mousePos);
        if (isLocked ? isBorderRightOrBottom(mousePos) : isBorder(mousePos)) {
          if (borderResizeRef.current !== "") {
            // event.preventDefault();
            const newRect = resizeRect(mouseCoord, rect, mousePos, false);

            if (trace) {
              console.log(
                `[${componentName}] resize Component: ${mousePos}: `,
                newRect
              );
            }

            resizeComponent(newRect as Size);
            setComponentSize(newRect as Size);
          }
          component.style.cursor = mouseCursor;
        } else {
          component.style.cursor = "default";
        }
      }
    };
    const handleResizingStop = (e: MouseEvent, origine = "mouseUp") => {
      restoreAlign(component, borderResizeRef.current);
      borderResizeRef.current = "";
      extendMouseMoveStop();
      borderEffectStop(component);
      if (setResizing) setResizing(false);

      if (trace && componentRef.current)
        console.log(`[${componentName}] resize stop, ${origine}`);
      component.style.cursor = "default";
    };

    /**
     * add the events listener
     */
    component.addEventListener(EVENT.MOUSE_DOWN, handleResizingStart);
    component.addEventListener(EVENT.MOUSE_MOVE, handleResizing);
    document.addEventListener(EVENT.MOUSE_UP, handleResizingStop);

    return () => {
      component.removeEventListener(EVENT.MOUSE_MOVE, handleResizingStart);
      component.removeEventListener(EVENT.MOUSE_DOWN, handleResizingStart);
      document.removeEventListener(EVENT.MOUSE_UP, handleResizingStop);
    };
  }, [isResizable.current, isLocked]);

  return (
    <SizeContext.Provider
      value={{
        componentSize,
        resizeComponent,
        setMinimumSize,
        hideComponent,
        showComponent,
        lockResize,
      }}
    >
      {children}

      {isResizable.current && (
        <button
          className="absolute -right-2 -bottom-2 p-1 text-gray-700 bg-gray-300 rounded-xl opacity-0 group-hover/resizable:opacity-40 hover:opacity-80 cursor-nw-resize"
          onClick={setResizeOn}
        >
          <MoveDiagonal2 size={14} />
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
