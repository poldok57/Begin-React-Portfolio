import React, { useState, useEffect, useRef } from "react";

import {
  mouseIsInsideComponent,
  getRectOffset,
} from "../../lib/mouse-position";
import { creatPlaceholder } from "../../lib/component-move";
import { TitleBar as TitleBar2 } from "./TitleBar";
import { generateRandomKey } from "./store";

import clsx from "clsx";

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
}

interface SelectComponentResult {
  waitEvent: HTMLElement | null;
  component: HTMLElement | null;
}
interface WithMousePositionProps {
  style?: React.CSSProperties;
  trace?: boolean;
  locked?: boolean;
  close?: boolean;
  className?: string | null;
  titleBar?: boolean;
  titleHidden?: boolean;
  title?: string;
  titleClassName?: string | null;
  titleHeight?: number;
}

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
export function withMousePosition<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & WithMousePositionProps> {
  return function WrappedComponentWithMousePosition({
    style,
    trace = false,
    close = false,
    locked = false,
    className = null,
    titleBar = false,
    titleHidden = true,
    title = "",
    titleClassName = null,
    titleHeight = 32,
    ...props
  }: WithMousePositionProps) {
    const titleRef = useRef(null);
    const componentRef = useRef(null);

    const offsetRef = useRef({ x: 0, y: 0 }); // for the difference between the mouse and the component
    const styleRef = useRef({ ...style });
    const canMoveRef = useRef(false);
    const mouseCoordinatesRef = useRef({ x: 0, y: 0 });

    const [isLocked, setLocked] = useState(locked);

    const randomKey = useRef(generateRandomKey());
    const id = title ? title : randomKey.current;

    const setMouseCoordinates = (x: number, y: number) => {
      mouseCoordinatesRef.current.x = x;
      mouseCoordinatesRef.current.y = y;
    };
    const getMouseCoordinates = () => mouseCoordinatesRef.current;

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
      const newStyle: CSSStyleDeclaration =
        styleRef.current as CSSStyleDeclaration;

      newStyle.left = coord.x + offsetRef.current.x + "px";
      newStyle.top = coord.y + offsetRef.current.y + "px";

      newStyle.right = "auto";
      newStyle.bottom = "auto";

      component.style.left = newStyle.left;
      component.style.top = newStyle.top;
      component.style.right = newStyle.right;
      component.style.bottom = newStyle.bottom;
      component.style.margin = "0";
      component.style.marginTop = "0";
      component.style.marginLeft = "0";
      component.style.position = newStyle.position;
    };

    useEffect(() => {
      const handleMouseMove = (event: MouseEvent) => {
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
          console.log(`[${WrappedComponent.name}] mouseEnter`);
        }
        /**
         * test the kind of position of the component
         */
        const { component } = selectComponent(titleBar);

        if (component) {
          const style = getComputedStyle(component);
          if (style.position && style.position !== POSITION.STATIC) {
            styleRef.current.position = style.position as POSITION;

            if (trace)
              console.log(
                `[${WrappedComponent.name}] copy position from computedStyle :`,
                styleRef.current.position
              );
          } else {
            styleRef.current.position = POSITION.RELATIVE;
            if (trace) {
              console.log(`[${WrappedComponent.name}] default Relative`);
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
      const mouseDown = (event: MouseEvent) => {
        event.preventDefault();
        /**
         * if where is a title bar, we need to move the component
         * when the mouse is down on the title bar
         */
        if (isLocked) return;

        const { waitEvent, component } = selectComponent(titleBar);
        if (waitEvent && waitEvent.contains(event.target as Node)) {
          const coord = { x: event.clientX, y: event.clientY };
          setCanMove(true);

          setMouseCoordinates(event.clientX, event.clientY);

          if (!component) return;

          // difference between the mouse and the component
          const compPos = {
            left: component.offsetLeft,
            top: component.offsetTop,
          } as DOMRect;
          offsetRef.current = getRectOffset(coord, compPos);
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
        className={clsx("hover:z-30", className, {
          group: !titleBar || titleHidden,
          "border-grey-800 cursor-pointer border shadow-lg": canMove(),
          "hover:cursor-default": isLocked || titleBar,
          "hover:cursor-move": !(isLocked || titleBar),
        })}
      >
        <WrappedComponent trace={trace} {...(props as P)} />

        <TitleBar2
          id={id}
          ref={titleRef}
          style={{
            top: titleHidden ? 0 : -titleHeight,
            height: titleHeight,
          }}
          className={clsx("w-full absolute group-hover:z-40", titleClassName, {
            "bg-primary rounded border border-gray-500 text-secondary":
              titleClassName === null && titleBar,
            group: titleBar && !titleHidden,
            "bg-transparent": !titleBar,
            "invisible group-hover:visible": titleBar && titleHidden,
            "opacity-60": titleBar && titleHidden && !isLocked,
            "opacity-10": titleBar && titleHidden && isLocked,
            "hover:cursor-move": titleBar && !isLocked,
          })}
          isLocked={isLocked}
          toggleLocked={toggleLocked}
          {...(close ? { onClose: hideComponent } : {})}
        >
          {title}
        </TitleBar2>
      </div>
    );
  };
}
