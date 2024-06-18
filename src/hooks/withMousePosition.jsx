import React, { useState, useEffect, useRef } from "react";

import { debounceLogs } from "../lib/debounce-logs";
import { mouseIsInsideComponent, getRectOffset } from "../lib/mouse-position";
import { creatPlaceholder } from "../lib/component-move";
import { ToggleSwitch } from "../components/atom/ToggleSwitch";
import { TitleBar } from "../components/atom/TitleBar";
import { CloseButton } from "../components/atom/CloseButton";
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
  STATIC: "static",
};

export function withMousePosition(Component) {
  /**
   * @param {Object} props
   * @param {Object} props.style  - the style of the component
   * @param {string} props.className  - the class name of the component
   * @param {boolean} props.locked - default true - if true, the component is locked
   * @param {boolean} props.titleBar - default false - if true, the component can be moved by the title bar
   * @param {boolean} props.titleHidden - default true - if true, the title bar is hidden
   * @param {boolean} props.trace - default false - if true, the trace is enabled
   * @param {boolean} props.close - default false - if true, the close button is displayed
   * @param {string} props.title - the title of the title bar
   * @param {string} props.titleClassName - the class name of the title bar
   * @param {number} props.titleHeight - the height of the title bar
   * @returns {JSX.Element} - the wrapped component
   */
  return function WrappedComponent({
    style = {},
    trace,
    className,
    titleBar = false,
    titleHidden = true,
    title = "",
    titleClassName = null,
    titleHeight = 32,
    ...props
  }) {
    const titleRef = useRef(null);
    const componentRef = useRef(null);

    const offsetRef = useRef({ x: 0, y: 0 }); // for the difference between the mouse and the component
    const styleRef = useRef({ ...style });
    const canMoveRef = useRef(false);
    const mouseCoordinatesRef = useRef({ x: 0, y: 0 });

    trace = trace === true || trace === "true" ? true : false;

    const close = useRef(
      props.close === true || props.close === "true" ? true : false
    );

    const [isLocked, setLocked] = useState(
      props.locked === true || props.locked === "true" ? true : false
    );

    titleBar = titleBar === true || titleBar === "true" ? true : false;
    titleHidden = titleHidden === true || titleHidden === "true" ? true : false;

    const setMouseCoordinates = (x, y) => {
      mouseCoordinatesRef.current.x = x;
      mouseCoordinatesRef.current.y = y;
    };
    const getMouseCoordinates = () => mouseCoordinatesRef.current;

    const setCanMove = (value) => {
      canMoveRef.current = value;
    };
    const canMove = () => canMoveRef.current;

    const selectComponent = (titleBar = null) => {
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

    const hideComponent = () => {
      const { component } = selectComponent();
      if (component) {
        component.style.display = "none";
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
      styleRef.current.width = width;

      component.style.position = POSITION.ABSOLUTE;
      component.style.width = width;
      component.style.left = left + "px";
      component.style.top = top + "px";
      component.style.margin = 0;
      component.style.marginTop = 0;
      component.style.marginLeft = 0;

      if (trace) {
        console.log(
          `[${Component.name}] pos: Relative to Absolute x:`,
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
    const toggleLocked = (event) => {
      if (trace) console.log(`[${Component.name}] toggleLocked`);
      if (
        styleRef.current.position === POSITION.RELATIVE &&
        !event.target.checked
      ) {
        if (trace) console.log(`[${Component.name}] convertRelativeToAbsolute`);
        convertRelativeToAbsolute();
      }

      setLocked(event.target.checked);
    };

    const calculNewPosition = () => {
      const coord = getMouseCoordinates();
      const { component } = selectComponent();
      const newStyle = styleRef.current;

      newStyle.left = coord.x + offsetRef.current.x + "px";
      newStyle.top = coord.y + offsetRef.current.y + "px";

      // delete margin if exists
      if (newStyle.margin) delete newStyle.margin;
      if (newStyle.marginTop) delete newStyle.marginTop;
      if (newStyle.marginLeft) delete newStyle.marginLeft;

      newStyle.right = "auto";
      newStyle.bottom = "auto";

      component.style.left = newStyle.left;
      component.style.top = newStyle.top;
      component.style.right = newStyle.right;
      component.style.bottom = newStyle.bottom;
      component.style.margin = newStyle.margin;
      component.style.marginTop = newStyle.marginTop;
      component.style.marginLeft = newStyle.marginLeft;
      component.style.position = newStyle.position;
    };

    useEffect(() => {
      const handleMouseMove = (event) => {
        if (canMove()) {
          const { waitEvent } = selectComponent(titleBar);
          if (!mouseIsInsideComponent(event, waitEvent)) {
            setCanMove(false);
            return;
          }

          setMouseCoordinates(event.clientX, event.clientY);
          calculNewPosition();
        }
      };

      const onMouseEnter = () => {
        if (trace) {
          console.log(`[${Component.name}] mouseEnter`);
        }
        /**
         * test the kind of position of the component
         */
        const { component } = selectComponent(titleBar);

        if (component) {
          const style = getComputedStyle(component);
          if (style.position && style.position !== POSITION.STATIC) {
            styleRef.current.position = style.position;

            if (trace)
              console.log(
                `[${Component.name}] copy position from computedStyle :`,
                styleRef.current.position
              );
          } else {
            styleRef.current.position = POSITION.RELATIVE;
            if (trace) {
              console.log(`[${Component.name}] default Relative`);
            }
          }

          if (
            isLocked == false &&
            styleRef.current.position == POSITION.RELATIVE
          ) {
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
        if (isLocked) return;

        const { waitEvent, component } = selectComponent(titleBar);
        if (waitEvent && waitEvent.contains(event.target)) {
          const coord = { x: event.clientX, y: event.clientY };
          setCanMove(true);

          setMouseCoordinates(event.clientX, event.clientY);

          // difference between the mouse and the component
          const compPos = {
            left: component.offsetLeft,
            top: component.offsetTop,
          };
          offsetRef.current = getRectOffset(coord, compPos);
          calculNewPosition();
        }
      };

      /**
       * When the mouse is up
       * @param {MouseEvent} event
       */
      const mouseUp = (event) => {
        setCanMove(false);
        setMouseCoordinates(event.clientX, event.clientY);
      };

      const handleMouseLeave = (event) => {
        if (trace) console.log(`[${Component.name}] mouseLeave`);
        if (canMove()) {
          mouseUp(event);
        }
      };
      /**
       * add the events listener
       */

      const { waitEvent, component } = selectComponent(titleBar);

      if (component && waitEvent) {
        waitEvent.addEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
        waitEvent.addEventListener(EVENT.MOUSE_UP, mouseUp);
        waitEvent.addEventListener(EVENT.MOUSE_LEAVE, handleMouseLeave);
        waitEvent.addEventListener(EVENT.MOUSE_DOWN, mouseDown);
        if (
          !styleRef.current ||
          !styleRef.current.position ||
          styleRef.current.position === POSITION.RELATIVE
        ) {
          component.addEventListener(EVENT.MOUSE_ENTER, onMouseEnter);
        }
      }

      return () => {
        if (waitEvent && component) {
          waitEvent.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
          waitEvent.removeEventListener(EVENT.MOUSE_UP, mouseUp);
          waitEvent.removeEventListener(EVENT.MOUSE_DOWN, mouseDown);
          component.removeEventListener(EVENT.MOUSE_ENTER, onMouseEnter);
        }
      };
    }, [isLocked]);

    return (
      <div
        ref={componentRef}
        style={{ ...styleRef.current }}
        className={clsx("group hover:z-40", className, {
          "border-grey-800 cursor-pointer border shadow-lg": canMove(),
          "hover:cursor-default": isLocked || titleBar,
          "hover:cursor-move": !(isLocked || titleBar),
        })}
      >
        <Component trace={trace} {...props} />

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
            className="absolute z-50 mt-1 opacity-0 color-primary left-2 group-hover:opacity-95"
          />
          {close.current && (
            <CloseButton
              className="absolute mt-1 right-2"
              onClick={hideComponent}
            />
          )}
        </div>
      </div>
    );
  };
}
