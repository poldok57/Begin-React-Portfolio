import React, { useState, useEffect, useRef } from "react";
import { MdOutlineClose } from "react-icons/md";
import { debounceLogs } from "../lib/debounce-logs";
import { ToggleSwitch } from "../components/atom/ToggleSwitch";
import clsx from "clsx";

const EVENT = {
  MOUSE_DOWN: "mousedown",
  MOUSE_UP: "mouseup",
  MOUSE_MOVE: "mousemove",
  MOUSE_OVER: "mouseover",
  MOUSE_OUT: "mouseleave",
};

export function withMousePosition(Component) {
  return function WrappedComponent({
    style = {},
    className,
    defaultFixed = "false",
    ...props
  }) {
    const [mousePosition, setMousePosition] = useState(null);

    const componentZIndex = useRef(style.zIndex ?? "auto");
    const componentRef = useRef(null);
    const componentPos = useRef(null);
    // const componentRect = useRef(null);

    const diffRef = useRef({ x: 0, y: 0 }); // for the difference between the mouse and the component
    const styleRef = useRef(style);
    const canMoveRef = useRef(false); // for the new
    const [fixed, setFixed] = useState(
      defaultFixed === "true" || defaultFixed == true ? true : false
    );
    // string to boolean
    const trace = useRef(props.trace === "true" ? true : false);
    const close = useRef(props.close === "true" ? true : false);

    const setCanMove = (value) => {
      canMoveRef.current = value;
    };

    const hideComponent = () => {
      const c = componentRef.current;
      if (c) {
        if (trace.current) console.log("hideComponent");
        c.style.display = "none";
      }
    };
    const toggleFixed = (event) => {
      const c = componentRef.current;
      if (c) {
        if (trace.current) console.log("toggleFixed");
      }
      setFixed(event.target.checked);
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

      const mouseDown = (event) => {
        event.preventDefault();
        const c = componentRef.current;
        if (c && c.contains(event.target)) {
          setCanMove(true);

          // componentRect.current = c.getBoundingClientRect();

          setMousePosition({ x: event.clientX, y: event.clientY });
          // difference between the mouse and the component
          diffRef.current = {
            x: event.clientX - c.offsetLeft,
            y: event.clientY - c.offsetTop,
          };

          document.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
          c.removeEventListener(EVENT.MOUSE_DOWN, mouseDown);
          c.addEventListener(EVENT.MOUSE_UP, mouseUp);
        }
      };

      const mouseUp = (event) => {
        const c = componentRef.current;
        if (c && c.contains(event.target)) {
          setCanMove(false);
          componentPos.current = { x: c.offsetLeft, y: c.offsetTop };
          setMousePosition({ x: event.clientX, y: event.clientY });
          document.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
          c.removeEventListener(EVENT.MOUSE_UP, mouseUp);
          if (fixed) {
            c.removeEventListener(EVENT.MOUSE_DOWN, mouseDown);
          } else {
            c.addEventListener(EVENT.MOUSE_DOWN, mouseDown);
          }

          if (trace.current)
            console.log("mouseUp", event.clientX, event.clientY);
        }
      };

      document.addEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
      const c = componentRef.current;
      if (c) {
        if (canMoveRef.current) {
          c.addEventListener(EVENT.MOUSE_UP, mouseUp);
        } else if (!fixed) {
          // disable mouseDown when fixed
          c.addEventListener(EVENT.MOUSE_DOWN, mouseDown);
        }
        // componentRect.current = c.getBoundingClientRect();
        componentPos.current = { x: c.offsetLeft, y: c.offsetTop };
      }

      return () => {
        document.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);

        if (c) {
          c.removeEventListener(EVENT.MOUSE_UP, mouseUp);
          c.removeEventListener(EVENT.MOUSE_DOWN, mouseDown);
        }
      };
    }, [fixed, mousePosition]);

    let newStyle = { ...styleRef.current };
    if (canMoveRef.current) {
      newStyle.left = mousePosition ? mousePosition.x - diffRef.current.x : 0;
      newStyle.top = mousePosition ? mousePosition.y - diffRef.current.y : 0;

      newStyle.zIndex = 800;
      newStyle.cursor = "pointer";

      if (newStyle.top && newStyle.bottom) delete newStyle.bottom;
      if (newStyle.left && newStyle.right) delete newStyle.right;
    } else {
      // const typeCursor = getCursors(componentRect.current, mousePosition);

      newStyle.cursor = fixed ? "default" : "move";
      newStyle.zIndex = componentZIndex.current;
      if (componentPos.current) {
        newStyle.left = componentPos.current.x;
        newStyle.top = componentPos.current.y;
        if (newStyle.bottom) delete newStyle.bottom;
        if (newStyle.right) delete newStyle.right;
      }
    }
    return (
      <div
        ref={componentRef}
        style={newStyle}
        className={clsx(className, "group", {
          "border-grey-800 border shadow-lg": canMoveRef.current,
        })}
      >
        <Component {...props} />
        <ToggleSwitch
          defaultChecked={fixed}
          onChange={toggleFixed}
          color="red"
          className="z-900 color-primary absolute top-1 left-1 opacity-0 group-hover:opacity-95"
        />
        {close.current && (
          <button
            className="z-900 color-primary absolute top-1 right-1 rounded border border-black bg-red-600 opacity-25 group-hover:opacity-95"
            onClick={hideComponent}
          >
            <MdOutlineClose />
          </button>
        )}
      </div>
    );
  };
}
