import React, { useState, useEffect, useRef } from "react";
import { MdOutlineClose } from "react-icons/md";
import { debounceLogs } from "../lib/debounce-logs";
import {
  mouseIsInsideRect,
  mouseIsOnBorderRect,
  mousePointer,
  BORDER,
} from "../lib/mouse-position";
import { ToggleSwitch } from "../components/atom/ToggleSwitch";
import { TitleBar } from "../components/atom/TitleBar";
import clsx from "clsx";

const EVENT = {
  MOUSE_DOWN: "mousedown",
  MOUSE_UP: "mouseup",
  MOUSE_MOVE: "mousemove",
  MOUSE_OVER: "mouseover",
  MOUSE_OUT: "mouseleave",
  MOUSE_ENTER: "mouseenter",
};
const POSITION = {
  RELATIVE: "relative",
  ABSOLUTE: "absolute",
};

export const mouseIsInsideComponent = (event, component) => {
  if (component) {
    const rect = component.getBoundingClientRect();
    const coordinates = { x: event.clientX, y: event.clientY };
    return mouseIsInsideRect(coordinates, rect);
  }
  return false;
};
export const mouseIsOnBorder = (event, component) => {
  if (component) {
    const rect = component.getBoundingClientRect();
    const coordinates = { x: event.clientX, y: event.clientY };
    return mouseIsOnBorderRect(coordinates, rect);
  }
  return null;
};

export function withMousePosition(Component) {
  /**
   * @param {Object} props
   * @param {Object} props.style  - the style of the component
   * @param {string} props.className  - the class name of the component
   * @param {boolean} props.locked - default true - if true, the component is locked
   * @param {boolean} props.titleBar - default false - if true, the component can be moved by the title bar
   * @param {boolean} props.titleHidden - default true - if true, the title bar is hidden
   * @param {string} props.title - the title of the title bar
   * @param {string} props.titleClassName - the class name of the title bar
   * @param {number} props.titleHeight - the height of the title bar
   * @returns {JSX.Element} - the wrapped component
   */
  return function WrappedComponent({
    style = {},
    className,
    locked = true,
    resizeable = false,
    titleBar = false,
    titleHidden = true,
    title = "",
    titleClassName = null,
    titleHeight = 30,
    ...props
  }) {
    const [mousePosition, setMousePosition] = useState(null);

    const titleRef = useRef(null);
    const componentRef = useRef(null);
    const componentPos = useRef(null);
    // const componentRect = useRef(null);

    const diffRef = useRef({ x: 0, y: 0 }); // for the difference between the mouse and the component
    const styleRef = useRef(style);
    const canMoveRef = useRef(false);
    const trace = useRef(props.trace === "true" ? true : false);
    const close = useRef(props.close === "true" ? true : false);
    const typePositionRef = useRef("");
    const newPosition = useRef(null);
    const [isLocked, setLocked] = useState(
      locked === true || locked == "true" ? true : false
    );
    let onBorderRef = useRef(BORDER.INSIDE);

    titleBar = titleBar === true || titleBar === "true" ? true : false;
    titleHidden = titleHidden === true || titleHidden === "true" ? true : false;
    resizeable = resizeable === true || resizeable === "true" ? true : false;

    const setCanMove = (value) => {
      canMoveRef.current = value;
    };
    const canMove = () => canMoveRef.current;

    const hideComponent = () => {
      const { component } = selectComponent(titleBar);
      if (component) {
        component.style.display = "none";
      }
    };
    /**
     * Convert the relative position to absolute
     */
    const convertRelativeToAbsolute = () => {
      const { component } = selectComponent(titleBar);
      if (component) {
        newPosition.current = {
          x: component.offsetLeft,
          y: component.offsetTop,
          position: POSITION.ABSOLUTE,
        };
        typePositionRef.current = POSITION.ABSOLUTE;
        styleRef.current.position = POSITION.ABSOLUTE;

        if (trace.current) {
          console.log(
            `[${Component.name}] pos: Relative to Absolute x:`,
            component.offsetLeft,
            " y:",
            component.offsetTop
          );
        }
      }
    };

    const resizeElement = ({ style, mouse, component, border }) => {
      const rect = component.getBoundingClientRect();
      let newStyle = { ...style };
      newStyle.left = rect.left;
      newStyle.top = rect.top;
      newStyle.width = rect.width;
      newStyle.height = rect.height;
      switch (border) {
        case BORDER.CORNER.TOP_LEFT:
          newStyle.width =
            component.offsetWidth + component.offsetLeft - mouse.x;
          newStyle.height =
            component.offsetHeight + component.offsetTop - mouse.y;
          newStyle.left = mouse.x;
          newStyle.top = mouse.y;
          break;
        case BORDER.CORNER.TOP_RIGHT:
          newStyle.width = mouse.x - component.offsetLeft;
          newStyle.height =
            component.offsetHeight + component.offsetTop - mouse.y;
          newStyle.top = mouse.y;
          break;

        case BORDER.CORNER.BOTTOM_LEFT:
          newStyle.width =
            component.offsetWidth + component.offsetLeft - mouse.x;
          newStyle.height = mouse.y - component.offsetTop;
          newStyle.left = mouse.x;
          break;
        case BORDER.CORNER.BOTTOM_RIGHT:
          newStyle.width = mouse.x - component.offsetLeft;
          newStyle.height = mouse.y - component.offsetTop;
          break;
        case BORDER.LEFT:
          newStyle.width =
            component.offsetWidth + component.offsetLeft - mouse.x;
          newStyle.left = mouse.x;
          break;
        case BORDER.RIGHT:
          newStyle.width = mouse.x - component.offsetLeft;
          break;
        case BORDER.TOP:
          newStyle.height =
            component.offsetHeight + component.offsetTop - mouse.y;
          newStyle.top = mouse.y;
          break;
        case BORDER.BOTTOM:
          newStyle.height = mouse.y - component.offsetTop;
          break;
        default:
          break;
      }
      return newStyle;
    };

    /**
     * Toggle the locked state
     * @param {Event} event
     */
    const toggleLocked = (event) => {
      if (trace.current) console.log(`[${Component.name}] toggleLocked`);

      if (
        typePositionRef.current === POSITION.RELATIVE &&
        !event.target.checked
      ) {
        convertRelativeToAbsolute();
      }

      setLocked(event.target.checked);
    };

    const selectComponent = (titleBar) => {
      // if there is a title bar, mouse apply only on the title bar
      if (titleBar) {
        return {
          waitEvent: titleRef.current,
          component: componentRef.current,
        };
      }
      return {
        waitEvent: componentRef.current,
        component: componentRef.current,
      };
    };

    useEffect(() => {
      const handleMouseMove = (event) => {
        if (canMove()) {
          const { waitEvent } = selectComponent(titleBar);
          if (!mouseIsInsideComponent(event, waitEvent)) {
            setCanMove(false);
            document.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
            waitEvent.removeEventListener(EVENT.MOUSE_UP, mouseUp);
            waitEvent.addEventListener(EVENT.MOUSE_DOWN, mouseDown);
            return;
          }
          setMousePosition({
            x: event.clientX,
            y: event.clientY,
          });
          if (trace.current)
            debounceLogs("move:", event.clientX, event.clientY);
        }
      };

      const onMouseEnter = () => {
        if (trace.current) {
          console.log(`[${Component.name}] mouseEnter`);
        }
        /**
         * test the kind of position
         */
        const { component } = selectComponent(titleBar);

        if (component && typePositionRef.current === "") {
          const style = getComputedStyle(component);
          if (style.position) {
            typePositionRef.current = style.position;
            if (trace.current)
              console.log(
                `[${Component.name}] copy position from computedStyle`,
                typePositionRef.current
              );
          } else {
            typePositionRef.current = POSITION.RELATIVE;
            if (trace.current) {
              console.log(`[${Component.name}] default Relative`);
            }
          }

          if (typePositionRef.current === POSITION.RELATIVE) {
            setLocked(true);
          }
          component.removeEventListener(EVENT.MOUSE_ENTER, onMouseEnter);
        }
      };

      /**
       * When the mouse is down
       * @param {MouseEvent} event
       */
      const mouseDown = (event) => {
        event.preventDefault();
        /**
         * if where is a title bar, we need to move the component
         * when the mouse is down on the title bar
         */
        const { waitEvent, component } = selectComponent(titleBar);
        if (waitEvent && waitEvent.contains(event.target)) {
          setCanMove(true);

          if (resizeable) {
            onBorderRef.current = mouseIsOnBorder(event, component);
          }

          setMousePosition({ x: event.clientX, y: event.clientY });
          // difference between the mouse and the component
          diffRef.current = {
            x: event.clientX - component.offsetLeft,
            y: event.clientY - component.offsetTop,
          };

          document.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
          waitEvent.removeEventListener(EVENT.MOUSE_DOWN, mouseDown);
          waitEvent.addEventListener(EVENT.MOUSE_UP, mouseUp);
          waitEvent.addEventListener(EVENT.MOUSE_LEAVE, handleMouseLeave);
        }
      };

      /**
       * When the mouse is up
       * @param {MouseEvent} event
       */
      const mouseUp = (event) => {
        const { waitEvent, component } = selectComponent(titleBar);
        if (waitEvent && waitEvent.contains(event.target)) {
          setCanMove(false);
          componentPos.current = {
            x: component.offsetLeft,
            y: component.offsetTop,
          };
          setMousePosition({ x: event.clientX, y: event.clientY });
          document.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
          waitEvent.removeEventListener(EVENT.MOUSE_UP, mouseUp);
          if (isLocked) {
            waitEvent.removeEventListener(EVENT.MOUSE_DOWN, mouseDown);
          } else {
            waitEvent.addEventListener(EVENT.MOUSE_DOWN, mouseDown);
          }

          if (trace.current)
            console.log(
              `[${Component.name}] mouseUp`,
              event.clientX,
              event.clientY
            );
        }
      };
      const handleMouseLeave = (event) => {
        if (trace.current) console.log(`[${Component.name}] mouseLeave`);
        if (canMove()) {
          mouseUp(event);
        }
      };
      /**
       * add the events listener
       */
      document.addEventListener(EVENT.MOUSE_MOVE, handleMouseMove);

      const { waitEvent, component: comp } = selectComponent(titleBar);

      if (comp) {
        if (canMove()) {
          waitEvent.addEventListener(EVENT.MOUSE_UP, mouseUp);
          waitEvent.addEventListener(EVENT.MOUSE_LEAVE, handleMouseLeave);
        } else if (!isLocked) {
          // disable mouseDown when locked
          waitEvent.addEventListener(EVENT.MOUSE_DOWN, mouseDown);
        }
        if (typePositionRef.current === "") {
          comp.addEventListener(EVENT.MOUSE_ENTER, onMouseEnter);
        }

        // if (resizeable) {
        //   componentRect.current = comp.getBoundingClientRect();
        // }
        componentPos.current = { x: comp.offsetLeft, y: comp.offsetTop };
      }

      return () => {
        document.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);

        if (waitEvent && comp) {
          waitEvent.removeEventListener(EVENT.MOUSE_UP, mouseUp);
          waitEvent.removeEventListener(EVENT.MOUSE_DOWN, mouseDown);
          comp.removeEventListener(EVENT.MOUSE_ENTER, onMouseEnter);
        }
      };
    }, [isLocked, mousePosition, titleBar, onBorderRef.current]);

    let newStyle = { ...styleRef.current };
    if (canMove()) {
      if (resizeable && onBorderRef.current !== BORDER.INSIDE) {
        /**
         * resize the component
         */
        newStyle = resizeElement({
          style: newStyle,
          mouse: mousePosition,
          component: componentRef.current,
          border: onBorderRef.current,
        });
      } else {
        /**
         * move the component
         */
        newStyle.left = mousePosition ? mousePosition.x - diffRef.current.x : 0;
        newStyle.top = mousePosition ? mousePosition.y - diffRef.current.y : 0;
        newStyle.position = typePositionRef.current;
      }
      if (trace.current) {
        debounceLogs(
          "new position:",
          newStyle.position,
          newStyle.left,
          newStyle.top,
          componentRef.current
        );
      }
    } else {
      if (componentPos.current) {
        if (newPosition.current !== null) {
          /**
           * New position is set when the component is changed from relative to absolute
           */
          newStyle.left = newPosition.current.x;
          newStyle.top = newPosition.current.y;
          newStyle.position = newPosition.current.position;
          newPosition.current = null;
        } else {
          newStyle.left = componentPos.current.x;
          newStyle.top = componentPos.current.y;
        }

        if (trace.current) {
          debounceLogs(
            `[${Component.name}] =>`,
            typePositionRef.current,
            ":",
            newStyle.left,
            newStyle.top
          );
        }
      }
    }
    if (newStyle.top) newStyle.bottom = "auto";
    if (newStyle.left) newStyle.right = "auto";

    const typeCursor = !(resizeable || isLocked)
      ? "move"
      : mousePointer(onBorderRef.current);
    if (trace.current) {
      debounceLogs(
        `[${Component.name}] cursor:`,
        typeCursor,
        "border:",
        onBorderRef.current
      );
    }
    return (
      <div
        ref={componentRef}
        style={newStyle}
        className={clsx("group hover:z-40", className, {
          "border-grey-800 cursor-pointer border shadow-lg": canMove(),
          "hover:cursor-default": isLocked || titleBar,
          "hover:cursor-move": !(isLocked || titleBar) && typeCursor === "move",
          "hover:cursor-ew-resize": typeCursor === "ew-resize",
          "hover:cursor-ns-resize": typeCursor === "ns-resize",
          "hover:cursor-nwse-resize": typeCursor === "nwse-resize",
          "hover:cursor-nesw-resize": typeCursor === "nesw-resize",
        })}
      >
        <Component {...props} />

        {titleBar && (
          <TitleBar
            ref={titleRef}
            style={{
              top: titleHidden ? 0 : -titleHeight,
              height: titleHeight,
              position: "absolute",
              width: "100%",
            }}
            className={clsx("group-over:z-50", titleClassName, {
              "rounded border  border-gray-500 bg-primary text-secondary":
                titleClassName === null,
              "invisible group-hover:visible": titleHidden,
              "opacity-60": titleHidden,
              "opacity-5": isLocked && titleHidden,
              "hover:cursor-move": !isLocked,
            })}
          >
            {title}
          </TitleBar>
        )}
        <div
          style={{
            top: titleHidden ? 2 : 2 - titleHeight,
            position: "absolute",
            width: "100%",
          }}
        >
          <ToggleSwitch
            defaultChecked={isLocked}
            onChange={toggleLocked}
            color="red"
            initialColor="green"
            className="z-900 color-primary absolute left-2 opacity-0 group-hover:opacity-95"
          />
          {close.current && (
            <button
              className="z-900 color-primary absolute right-2 rounded border border-black bg-red-600 opacity-25 group-hover:opacity-95"
              onClick={hideComponent}
            >
              <MdOutlineClose />
            </button>
          )}
        </div>
      </div>
    );
  };
}
