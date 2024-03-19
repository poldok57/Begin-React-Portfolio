import React, { useState, useEffect, useRef } from "react";
import { MdOutlineClose } from "react-icons/md";
import { debounceLogs } from "../lib/debounce-logs";
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

export function withMousePosition(Component) {
  return function WrappedComponent({
    style = {},
    className,
    locked = true,
    titleBar = false,
    titleHide = true,
    title = "",
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

    titleBar = titleBar === true || titleBar === "true" ? true : false;
    titleHide = titleHide === true || titleHide === "true" ? true : false;

    const setCanMove = (value) => {
      canMoveRef.current = value;
    };

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
          waitEffect: titleRef.current,
          component: componentRef.current,
        };
      }
      return {
        waitEffect: componentRef.current,
        component: componentRef.current,
      };
    };

    useEffect(() => {
      const handleMouseMove = (event) => {
        if (canMoveRef.current) {
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
        const { waitEffect, component } = selectComponent(titleBar);
        if (waitEffect && waitEffect.contains(event.target)) {
          setCanMove(true);

          // componentRect.current = component.getBoundingClientRect();

          setMousePosition({ x: event.clientX, y: event.clientY });
          // difference between the mouse and the component
          diffRef.current = {
            x: event.clientX - component.offsetLeft,
            y: event.clientY - component.offsetTop,
          };

          document.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
          waitEffect.removeEventListener(EVENT.MOUSE_DOWN, mouseDown);
          waitEffect.addEventListener(EVENT.MOUSE_UP, mouseUp);
        }
      };

      /**
       * When the mouse is up
       * @param {MouseEvent} event
       */
      const mouseUp = (event) => {
        const { waitEffect, component } = selectComponent(titleBar);
        if (waitEffect && waitEffect.contains(event.target)) {
          setCanMove(false);
          componentPos.current = {
            x: component.offsetLeft,
            y: component.offsetTop,
          };
          setMousePosition({ x: event.clientX, y: event.clientY });
          document.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
          waitEffect.removeEventListener(EVENT.MOUSE_UP, mouseUp);
          if (isLocked) {
            waitEffect.removeEventListener(EVENT.MOUSE_DOWN, mouseDown);
          } else {
            waitEffect.addEventListener(EVENT.MOUSE_DOWN, mouseDown);
          }

          if (trace.current)
            console.log(
              `[${Component.name}] mouseUp`,
              event.clientX,
              event.clientY
            );
        }
      };
      /**
       * add the events listener
       */
      document.addEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
      // const c = selectComponent(titleBar);
      // const comp = componentRef.current;
      const { waitEffect, component: comp } = selectComponent(titleBar);

      // if (trace.current) {
      //   console.log(`[${Component.name}] addEventListener to:`, c);
      // }

      if (comp) {
        if (canMoveRef.current) {
          waitEffect.addEventListener(EVENT.MOUSE_UP, mouseUp);
        } else if (!isLocked) {
          // disable mouseDown when locked
          waitEffect.addEventListener(EVENT.MOUSE_DOWN, mouseDown);
        }
        if (typePositionRef.current === "") {
          comp.addEventListener(EVENT.MOUSE_ENTER, onMouseEnter);
        }

        // componentRect.current = component.getBoundingClientRect();
        componentPos.current = { x: comp.offsetLeft, y: comp.offsetTop };
      }

      return () => {
        document.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);

        if (waitEffect && comp) {
          waitEffect.removeEventListener(EVENT.MOUSE_UP, mouseUp);
          waitEffect.removeEventListener(EVENT.MOUSE_DOWN, mouseDown);
          comp.removeEventListener(EVENT.MOUSE_ENTER, onMouseEnter);
        }
      };
    }, [isLocked, mousePosition, titleBar]);

    let newStyle = { ...styleRef.current };
    if (canMoveRef.current) {
      /**
       * move the component
       */
      newStyle.left = mousePosition ? mousePosition.x - diffRef.current.x : 0;
      newStyle.top = mousePosition ? mousePosition.y - diffRef.current.y : 0;
      newStyle.position = typePositionRef.current;
      if (trace.current) {
        debounceLogs(
          "new position:",
          newStyle.position,
          newStyle.left,
          newStyle.top,
          componentRef.current
        );
      }

      if (newStyle.top && newStyle.bottom) delete newStyle.bottom;
      if (newStyle.left && newStyle.right) delete newStyle.right;
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

        if (newStyle.bottom) delete newStyle.bottom;
        if (newStyle.right) delete newStyle.right;

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
    return (
      <div
        ref={componentRef}
        style={newStyle}
        className={clsx("group hover:z-40", className, {
          "border-grey-800 cursor-pointer border shadow-lg": canMoveRef.current,
          "hover:cursor-default": isLocked || titleBar,
          "hover:cursor-move": !(isLocked || titleBar),
        })}
      >
        <Component {...props} />

        {titleBar && (
          <TitleBar
            ref={titleRef}
            style={{
              top: titleHide ? 0 : -titleHeight,
              height: titleHeight,
              position: "absolute",
              width: "100%",
            }}
            className={clsx(
              "group-over:z-50 border-1 rounded border-gray-500 bg-primary text-secondary",
              {
                "invisible group-hover:visible": titleHide,
                "opacity-60": titleHide,
                "opacity-5": isLocked && titleHide,
                "hover:cursor-move": !isLocked,
              }
            )}
          >
            {title}
          </TitleBar>
        )}
        <div
          style={{
            top: titleHide ? 2 : 2 - titleHeight,
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
