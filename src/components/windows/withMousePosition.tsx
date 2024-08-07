import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";

import {
  mouseIsInsideComponent,
  getRectOffset,
} from "../../lib/mouse-position";
import { creatPlaceholder } from "../../lib/component-move";
import { TitleBar } from "./TitleBar";
import { generateRandomKey } from "./store";
import { getContrastColor } from "../../lib/utils/colors";
import { isAlignedRight, isAlignedBottom } from "../../lib/utils/position";
import { MoveDiagonal2 } from "lucide-react";
import {
  BORDER,
  mouseIsOnBorderRect,
  mousePointer,
  isBorder,
  isBorderRightOrBottom,
  isBorderLeft,
  isBorderTop,
  resizeRect,
} from "../../lib/mouse-position";

import clsx from "clsx";

import { Size, Rectangle, Coordinate } from "../../lib/canvas/types";

enum EVENT {
  MOUSE_DOWN = "mousedown",
  MOUSE_UP = "mouseup",
  MOUSE_MOVE = "mousemove",
  MOUSE_OVER = "mouseover",
  MOUSE_LEAVE = "mouseleave",
  MOUSE_ENTER = "mouseenter",
}
enum POSITION {
  RELATIVE = "relative",
  ABSOLUTE = "absolute",
  STATIC = "static",
  FIXED = "fixed",
}

interface ComponentSizeContext {
  componentSize: Size;
  lockResize: (lock: boolean) => void;
  resizeComponent: (size: Size) => void;
  hideComponent: () => void;
  showComponent: () => void;
}
// context for the component size
const SizeContext = createContext<ComponentSizeContext | null>(null);

interface SelectComponentResult {
  waitEvent: HTMLElement | null;
  component: HTMLElement | null;
}
interface WithMousePositionProps {
  id?: string;
  style?: React.CSSProperties;
  trace?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  close?: boolean;
  className?: string | null;
  titleBar?: boolean;
  titleHidden?: boolean;
  title?: string;
  bgTitle?: string | null;
  titleClassName?: string | null;
  titleHeight?: number;
  withMinimize?: boolean;
  withMaximize?: boolean;
}

/**
 * @param {Object} props
 * @param {string} props.id - the id of the component
 * @param {Object} props.style  - the style of the component
 * @param {string} props.className  - the class name of the component
 * @param {boolean} draggable - default true - if true, the component is draggable
 * @param {boolean} resizable - default false - if true, the component is resizable
 * @param {boolean} props.titleBar - default false - if true, the component can be moved by the title bar
 * @param {boolean} props.titleHidden - default true - if true, the title bar is hidden
 * @param {boolean} props.trace - default false - if true, the trace is enabled
 * @param {boolean} props.close - default false - if true, the close button is displayed
 * @param {string} props.title - the title of the title bar
 * @param {string} props.titleClassName - the class name of the title bar
 * @param {number} props.titleHeight - the height of the title bar
 * @param {string} props.bgTitle - the background color of the title bar
 * @returns {JSX.Element} - the wrapped component
 */
export function withMousePosition<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & WithMousePositionProps> {
  return function WrappedComponentWithMousePosition({
    style,
    id,
    trace = false,
    close = false,
    draggable = true,
    resizable = false,
    className = null,
    titleBar = false,
    titleHidden = true,
    title = "",
    titleClassName = null,
    bgTitle = null,
    titleHeight = 36,
    withMinimize = false,
    withMaximize = false,

    ...props
  }: WithMousePositionProps) {
    const titleRef = useRef(null);
    const componentRef = useRef(null);

    const offsetRef = useRef({ x: 0, y: 0 }); // for the difference between the mouse and the component
    const styleRef = useRef({ ...style });
    const canMoveRef = useRef(false);
    const memoDisplayRef = useRef("");
    const mouseCoordinatesRef = useRef<Coordinate>({ x: 0, y: 0 });

    const [isLocked, setLocked] = useState(!draggable);

    const randomKey = useRef(generateRandomKey());
    const idKey = id ? id : title ? title : randomKey.current;

    const isAlignedRightRef = useRef(false);
    const isAlignedBottomRef = useRef(false);

    const [componentSize, setComponentSize] = useState<Size>({
      width: 0,
      height: 0,
    });
    const memoResizable = resizable;
    const borderResizeRef = useRef("");

    const setMouseCoordinates = (x: number, y: number) => {
      mouseCoordinatesRef.current.x = x;
      mouseCoordinatesRef.current.y = y;
    };
    const getMouseCoordinates: () => Coordinate = () =>
      mouseCoordinatesRef.current;

    const setCanMove = (value: boolean) => {
      canMoveRef.current = value;
    };
    const canMove = () => canMoveRef.current;

    const selectComponent: (titleBar?: boolean) => SelectComponentResult = (
      titleBar = false
    ) => {
      if (titleBar && titleRef?.current) {
        return {
          waitEvent: titleRef.current,
          component: componentRef?.current || null,
        };
      }
      return {
        waitEvent: componentRef?.current || null,
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
        resizable = false;
      } else {
        resizable = memoResizable;
      }
    };
    /**
     * Convert the relative position to absolute
     */
    const convertRelativeToAbsolute = () => {
      const { component } = selectComponent();
      if (!component) return;

      /**
       * New position is set when the component is changed from relative to absolute
       */
      const left = component.offsetLeft,
        top = component.offsetTop,
        width = window.getComputedStyle(component).width;

      styleRef.current.position = POSITION.ABSOLUTE;

      component.style.position = POSITION.ABSOLUTE;
      component.style.width = width;
      component.style.left = left + "px";
      component.style.top = top + "px";
      component.style.margin = "0";
      component.style.marginTop = "0";
      component.style.marginLeft = "0";

      if (trace) {
        console.log(
          `[${WrappedComponent.name}] pos: Relative to Absolute x:`,
          component.offsetLeft,
          " y:",
          component.offsetTop
        );
      }
      creatPlaceholder(component);
    };

    /**
     * Toggle the locked state
     * @param {Event} event
     */
    const toggleLocked = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (trace) console.log(`[${WrappedComponent.name}] toggleLocked`);
      if (
        styleRef.current.position === POSITION.RELATIVE &&
        !event.target.checked
      ) {
        if (trace)
          console.log(`[${WrappedComponent.name}] convertRelativeToAbsolute`);
        convertRelativeToAbsolute();
      }

      setLocked(event.target.checked);
    };

    const calculNewPosition = () => {
      const coord = getMouseCoordinates();
      const { component } = selectComponent();
      if (!component) return;
      const newStyle: CSSStyleDeclaration = {
        ...styleRef.current,
      } as CSSStyleDeclaration;

      newStyle.left = coord.x + offsetRef.current.x + "px";
      newStyle.top = coord.y + offsetRef.current.y + "px";
      newStyle.right = "auto";
      newStyle.bottom = "auto";

      // If the element is fixed and aligned to the right, calculate its position relative to right
      if (newStyle.position === POSITION.FIXED) {
        // element fixed and aligned right
        if (isAlignedRightRef.current) {
          const windowWidth = document.documentElement.clientWidth;
          const componentWidth = component.offsetWidth;

          // Calculate the right position taking into account the current cursor position
          const rightPosition =
            windowWidth - (coord.x + offsetRef.current.x) - componentWidth;

          newStyle.right = `${rightPosition}px`;
          newStyle.left = "auto";
          if (trace) {
            console.log(
              `[${WrappedComponent.name}] isAlignedRight: ${rightPosition}`
            );
          }
        }

        if (isAlignedBottomRef.current) {
          const windowHeight = document.documentElement.clientHeight;
          const componentHeight = component.offsetHeight;
          const bottomPosition =
            windowHeight - coord.y - offsetRef.current.y - componentHeight;

          newStyle.top = "auto";
          newStyle.bottom = `${bottomPosition}px`;
        }
      }

      component.style.left = newStyle.left;
      component.style.right = newStyle.right;
      component.style.top = newStyle.top;
      component.style.bottom = newStyle.bottom;

      component.style.margin = "0";
      component.style.marginTop = "0";
      component.style.marginLeft = "0";
      component.style.position = newStyle.position;
      component.style.transition = "top 0s, left 0s";
    };

    const updateComponentSize = () => {
      const { component } = selectComponent();
      if (component) {
        const rect = component.getBoundingClientRect();
        setComponentSize({ width: rect.width, height: rect.height });
        if (trace)
          console.log(
            `${WrappedComponent.name} set size: ${rect.width} x ${rect.height}`
          );
      }
    };
    const resizeComponent = (size: Size | Rectangle) => {
      const { component } = selectComponent();
      if (component) {
        component.style.width = !size.width ? "auto" : size.width + "px";
        component.style.height = !size.height ? "auto" : size.height + "px";
      }
    };

    const setResizeOn = () => {
      const { component } = selectComponent();
      if (component) {
        component.style.cursor = "nwse-resize";
      }
      borderResizeRef.current = BORDER.CORNER.BOTTOM_RIGHT;
    };

    const changeAlign = (component: HTMLElement, mousePos: string) => {
      if (!isBorderLeft(mousePos) && !isBorderTop(mousePos)) {
        return;
      }

      const rect = component.getBoundingClientRect();
      if (isBorderLeft(mousePos) && !isAlignedRightRef.current) {
        const windowWidth = document.documentElement.clientWidth;
        const parentWidth =
          component.offsetParent?.getBoundingClientRect().right || windowWidth;

        const right =
          styleRef.current.position === POSITION.FIXED
            ? windowWidth - rect.right
            : parentWidth - rect.right;
        // const componentWidth = component.offsetWidth;
        console.log(
          `[${WrappedComponent.name}] --- Change-Align: position: ${
            styleRef.current.position
          } width: ${
            styleRef.current.position === POSITION.FIXED
              ? parentWidth
              : windowWidth
          } - rect.right: ${rect.right} = ${right}px`
        );
        // windowWidth - component.offsetLeft - component.offsetWidth

        component.style.right = `${right}px`;
        component.style.left = "auto";

        if (typeof styleRef.current.left !== "undefined") {
          delete styleRef.current.left;
        }
        if (typeof styleRef.current.right !== "undefined") {
          delete styleRef.current.right;
        }
      }
      if (isBorderTop(mousePos) && !isAlignedBottomRef.current) {
        const windowHeight = document.documentElement.clientHeight;
        const parentHeight =
          component.offsetParent?.getBoundingClientRect().bottom ||
          windowHeight;

        const bottom =
          styleRef.current.position === POSITION.FIXED
            ? windowHeight - rect.bottom
            : parentHeight - rect.bottom;

        console.log(
          `[${WrappedComponent.name}] --- Change-Align: position: ${
            styleRef.current.position
          } height: ${
            styleRef.current.position === POSITION.FIXED
              ? parentHeight
              : windowHeight
          } - rect.bottom: ${rect.bottom} = ${bottom}px`
        );

        component.style.top = "auto";
        component.style.bottom = `${bottom}px`;

        if (typeof styleRef.current.top !== "undefined") {
          delete styleRef.current.top;
        }
        if (typeof styleRef.current.bottom !== "undefined") {
          delete styleRef.current.bottom;
        }
      }

      // Ajout d'un effet de bordure au composant parent
      const parentElement = component.offsetParent as HTMLElement;
      if (parentElement) {
        parentElement.style.transition = "border 5s ease-out";
        parentElement.style.border = "2px dotted red";

        setTimeout(() => {
          parentElement.style.border = "none";
        }, 2000);

        setTimeout(() => {
          parentElement.style.transition = "";
        }, 7000);
      }
    };

    const restoreAlign = (component: HTMLElement, mousePos: string) => {
      if (!isBorderLeft(mousePos) && !isBorderTop(mousePos)) {
        return;
      }

      setTimeout(() => {
        console.log(`[${WrappedComponent.name}] restoreAlign: ${mousePos}`);
        if (isBorderLeft(mousePos)) {
          component.style.left = `${component.offsetLeft}px`;
          component.style.right = "auto";
        }
        if (isBorderTop(mousePos)) {
          component.style.top = `${component.offsetTop}px`;
          component.style.bottom = "auto";
        }
      }, 0);
    };

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
    }, []);

    useEffect(() => {
      /**
       * test if the component is aligned right or bottom
       */
      const { component } = selectComponent(false);
      if (!component) return;

      memoDisplayRef.current = component.style.display;
      /**
       * test the kind of position of the component
       */
      const style = getComputedStyle(component);

      if (!style.position || style.position === POSITION.STATIC) {
        // position is not set, set it to relative
        styleRef.current.position = POSITION.RELATIVE;
      } else {
        styleRef.current.position = style.position as POSITION;
      }
      // if the component is relative and not locked, lock it
      if (styleRef.current.position == POSITION.RELATIVE && isLocked == false) {
        setLocked(true);
      }

      /**
       * find aligned right or bottom
       */
      isAlignedRightRef.current = isAlignedRight(
        styleRef.current as CSSStyleDeclaration,
        style
      );
      isAlignedBottomRef.current = isAlignedBottom(
        styleRef.current as CSSStyleDeclaration,
        style
      );
      if (trace) {
        console.log(
          `[${WrappedComponent.name}] isAligned: ${
            isAlignedRightRef.current ? "Right" : "Left"
          }`
        );
        console.log(
          `[${WrappedComponent.name}] isAlignedBottom: ${
            isAlignedBottomRef.current ? "Bottom" : "Top"
          }`
        );
      }
    }, []);

    /**
     * Event for resize the component
     */
    useEffect(() => {
      const { component } = selectComponent(false);
      if (!resizable || !component) {
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

        if (mousePos) {
          const mouseCursor = mousePointer(mousePos);
          if (isLocked ? isBorderRightOrBottom(mousePos) : isBorder(mousePos)) {
            borderResizeRef.current = mousePos;
            offsetRef.current = getRectOffset(
              { x: event.clientX, y: event.clientY },
              {
                left: component.offsetLeft,
                top: component.offsetTop,
              }
            );
            console.log(
              `[${WrappedComponent.name}] resize Component Start : ${mousePos}`
            );
            component.style.cursor = mouseCursor;
            event.preventDefault();
            extendMouseMove();

            if (isBorderLeft(mousePos) || isBorderTop(mousePos)) {
              changeAlign(component, mousePos);
            }
          } else {
            component.style.cursor = "default";
          }
        }
      };
      const handleResizing = (event: MouseEvent) => {
        const rect = component.getBoundingClientRect();
        const mouseCoord: Coordinate = { x: event.clientX, y: event.clientY };

        if (event.buttons !== 1 && borderResizeRef.current !== "") {
          if (
            isBorderLeft(borderResizeRef.current) ||
            isBorderTop(borderResizeRef.current)
          ) {
            restoreAlign(component, borderResizeRef.current);
          }
          borderResizeRef.current = "";
          if (trace)
            console.log(
              `[${WrappedComponent.name}] resize stop, Button:  ${event.buttons}`
            );
        }

        const mousePos =
          borderResizeRef.current !== ""
            ? borderResizeRef.current
            : mouseIsOnBorderRect(mouseCoord, rect);

        if (mousePos) {
          if (trace)
            console.log(
              `[${WrappedComponent.name}] mouse-move, mousePos: ${mousePos}`
            );
          const mouseCursor = mousePointer(mousePos);
          if (isLocked ? isBorderRightOrBottom(mousePos) : isBorder(mousePos)) {
            if (borderResizeRef.current !== "") {
              // event.preventDefault();
              const newRect = resizeRect(mouseCoord, rect, mousePos, false);

              resizeComponent(newRect as Size);
              setComponentSize(newRect as Size);
            }
            component.style.cursor = mouseCursor;
          } else {
            component.style.cursor = "default";
          }
        }
      };
      const handleResizingStop = () => {
        if (
          isBorderLeft(borderResizeRef.current) ||
          isBorderTop(borderResizeRef.current)
        ) {
          restoreAlign(component, borderResizeRef.current);
        }
        borderResizeRef.current = "";
        extendMouseMoveStop();

        if (trace)
          console.log(`[${WrappedComponent.name}] resize stop, mouseUp`);
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
    }, [resizable, isLocked]);

    /**
     * Event for move the component
     */
    useEffect(() => {
      const { waitEvent } = selectComponent(titleBar);
      if (isLocked || !waitEvent) {
        return;
      }

      const handleMouseMove = (event: MouseEvent) => {
        if (!canMove()) {
          return;
        }
        if (!mouseIsInsideComponent(event, waitEvent)) {
          setCanMove(false);
          return;
        }

        setMouseCoordinates(event.clientX, event.clientY);
        calculNewPosition();
      };

      /**
       * When the mouse is down
       * @param {MouseEvent} event
       */
      const mouseDown = (event: MouseEvent) => {
        if (trace) {
          console.log(
            `[${WrappedComponent.name}] mouseDown, isLocked: ${isLocked}`
          );
        }
        event.preventDefault();
        /**
         * if where is a title bar, we need to move the component
         * when the mouse is down on the title bar
         */
        if (isLocked) return;

        const { component } = selectComponent(titleBar);
        if (waitEvent && waitEvent.contains(event.target as Node)) {
          const coord = { x: event.clientX, y: event.clientY };
          setCanMove(true);

          setMouseCoordinates(event.clientX, event.clientY);

          if (!component) return;

          // difference between the mouse and the component
          offsetRef.current = getRectOffset(coord, {
            left: component.offsetLeft,
            top: component.offsetTop,
          });
          calculNewPosition();
        }
      };

      /**
       * When the mouse is up
       * @param {MouseEvent} event
       */
      const mouseUp = (event: MouseEvent) => {
        setCanMove(false);
        setMouseCoordinates(event.clientX, event.clientY);
      };

      const handleMouseLeave = (event: MouseEvent) => {
        if (trace) console.log(`[${WrappedComponent.name}] mouseLeave`);
        if (canMove()) {
          mouseUp(event);
        }
      };
      /**
       * add the events listener
       */
      waitEvent.addEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
      waitEvent.addEventListener(EVENT.MOUSE_UP, mouseUp);
      waitEvent.addEventListener(EVENT.MOUSE_LEAVE, handleMouseLeave);
      waitEvent.addEventListener(EVENT.MOUSE_DOWN, mouseDown);

      return () => {
        waitEvent.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
        waitEvent.removeEventListener(EVENT.MOUSE_UP, mouseUp);
        waitEvent.removeEventListener(EVENT.MOUSE_DOWN, mouseDown);
      };
    }, [isLocked, titleBar]);

    return (
      <SizeContext.Provider
        value={{
          componentSize,
          resizeComponent,
          hideComponent,
          showComponent,
          lockResize,
        }}
      >
        <div
          ref={componentRef}
          id={id}
          style={{ ...styleRef.current }}
          className={clsx("hover:z-30", className, {
            "h-fit": resizable,
            "group/draggable": !titleBar || titleHidden,
            "border-grey-800 cursor-pointer border shadow-lg": canMove(),
            "hover:cursor-default": isLocked || titleBar,
            "hover:cursor-move": !(isLocked || titleBar),
          })}
        >
          <WrappedComponent trace={trace} {...(props as P)} />
          <TitleBar
            id={idKey}
            ref={titleRef}
            style={{
              height: titleHeight,
              transform: titleHidden ? "none" : "translateY(-100%)",
              ...(bgTitle
                ? { backgroundColor: bgTitle, color: getContrastColor(bgTitle) }
                : {}),
            }}
            className={clsx("group-hover/draggable:z-40", titleClassName, {
              "bg-primary rounded border border-gray-500 text-secondary":
                titleClassName === null && titleBar,
              "group/draggable": titleBar && !titleHidden,
              "bg-transparent": !titleBar,
              "invisible group-hover/draggable:visible":
                titleBar && titleHidden,
              "opacity-60": titleBar && titleHidden && !isLocked,
              "opacity-80":
                titleBar && titleHidden && (withMinimize || withMaximize),
              "opacity-10": titleBar && titleHidden && isLocked,
              "hover:cursor-move": titleBar && !isLocked,
            })}
            isLocked={isLocked}
            toggleLocked={toggleLocked}
            withMinimize={withMinimize}
            withMaximize={withMaximize}
            {...(close ? { onClose: hideComponent } : {})}
          >
            {title}
          </TitleBar>
          {resizable && (
            <button
              className="absolute -right-2 -bottom-2 p-1 text-gray-700 bg-gray-300 rounded-xl opacity-35 hover:opacity-80 cursor-nw-resize"
              onClick={setResizeOn}
            >
              <MoveDiagonal2 size={14} />
            </button>
          )}
        </div>
      </SizeContext.Provider>
    );
  };
}

// export the context for the component size
export const useComponentSize = () => {
  const context = useContext(SizeContext);
  if (!context) {
    throw new Error("useComponentSize must be used within a SizeProvider");
  }
  return context;
};
