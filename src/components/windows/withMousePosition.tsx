import React, { useState, useEffect, useRef } from "react";

import {
  coordinateIsInsideRect,
  mouseIsInsideBorder,
  getRectOffset,
} from "../../lib/mouse-position";
import { creatPlaceholder } from "../../lib/component-move";
import { TitleBar } from "./TitleBar";
import { WithResizing } from "./WithResizing";
import { generateRandomKey } from "./store";
import { getContrastColor } from "../../lib/utils/colors";
import { isAlignedRight, isAlignedBottom } from "../../lib/utils/position";

import clsx from "clsx";

import { Coordinate, RectPosition } from "../../lib/canvas/types";
import { EVENT, POSITION } from "./types";

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
  withTitleBar?: boolean;
  titleHidden?: boolean;
  titleText?: string;
  titleBackground?: string | null;
  titleClassName?: string | null;
  titleHeight?: number;
  withMinimize?: boolean;
  withMaximize?: boolean;
  withToggleLock?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMove?: (id: string, position: RectPosition) => void;
}

/**
 * @param {Object} props
 * @param {string} props.id - the id of the component
 * @param {Object} props.style  - the style of the component
 * @param {string} props.className  - the class name of the component
 * @param {boolean} draggable - default true - if true, the component is draggable
 * @param {boolean} resizable - default false - if true, the component is resizable
 * @param {boolean} props.withTitleBar - default false - if true, the component can be moved by the title bar
 * @param {boolean} props.titleHidden - default true - if true, the title bar is hidden
 * @param {boolean} props.trace - default false - if true, the trace is enabled
 * @param {boolean} props.close - default false - if true, the close button is displayed
 * @param {string} props.titleText - the text of the title bar
 * @param {string} props.titleClassName - the class name of the title bar
 * @param {number} props.titleHeight - the height of the title bar
 * @param {string} props.titleBackground - the background color of the title bar
 * @param {boolean} props.withToggleLock - default false - if true, the lock button is displayed
 * @param {boolean} props.withMinimize - default false - if true, the minimize button is displayed
 * @param {boolean} props.withMaximize - default false - if true, the maximize button is displayed
 * @param {function} props.onMove - the function to call when the component is moved
 * @param {function} props.onClick - the function to call when the component is clicked
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
    withTitleBar = false,
    titleHidden = true,
    titleText = "",
    titleClassName = null,
    titleBackground = null,
    titleHeight = 36,
    withMinimize = false,
    withMaximize = false,
    withToggleLock = true,
    minWidth = 0,
    minHeight = 0,
    maxWidth = 0,
    maxHeight = 0,
    onMove,
    onClick,
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
    const idKey = id ? id : titleText ? titleText : randomKey.current;

    const isAlignedRightRef = useRef(false);
    const isAlignedBottomRef = useRef(false);

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

    const selectComponent: (withTitleBar?: boolean) => SelectComponentResult = (
      withTitleBar = false
    ) => {
      if (withTitleBar && titleRef?.current) {
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
      creatPlaceholder(component, styleRef.current as CSSStyleDeclaration);
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

      if (trace)
        console.log(
          `[${WrappedComponent.name}-WMP] calculNewPosition: ${newStyle.left} ${newStyle.right} ${newStyle.top} ${newStyle.bottom}`
        );
    };

    const handleOnMove = () => {
      const { component } = selectComponent();
      if (!component || !id || !onMove) return;
      const position = {
        left: component.offsetLeft,
        top: component.offsetTop,
      };
      if (trace)
        console.log(
          `[${WrappedComponent.name}] handleOnMove: ${id} ${position}`
        );
      onMove?.(id, position);
    };

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
          `[${WrappedComponent.name}] Align: ${
            isAlignedRightRef.current ? "Right" : "Left"
          } and ${isAlignedBottomRef.current ? "Bottom" : "Top"}`
        );
      }
    }, []);

    /**
     * Event for move the component
     */
    useEffect(() => {
      const { waitEvent } = selectComponent(withTitleBar);
      if (isLocked || !waitEvent) {
        return;
      }

      const handleMove = (
        event: MouseEvent | TouchEvent,
        coord: Coordinate
      ) => {
        if (!canMove()) {
          return false;
        }
        const rect = waitEvent.getBoundingClientRect();
        if (!coordinateIsInsideRect(coord, rect)) {
          setCanMove(false);
          return false;
        }
        event.stopPropagation();
        event.preventDefault();
        setMouseCoordinates(coord.x, coord.y);
        calculNewPosition();
        return true;
      };

      const handleMouseMove = (event: MouseEvent) => {
        event.preventDefault();
        handleMove(event, { x: event.clientX, y: event.clientY });
      };

      /**
       * Start the drag action
       */
      const startDrag = (event: MouseEvent | TouchEvent, coord: Coordinate) => {
        const { component } = selectComponent();
        if (!component) return false;

        const rectComponent = component.getBoundingClientRect();
        const rectWaitEvent = waitEvent.getBoundingClientRect();
        // if the component is resizable, we need to check if the mouse is inside the border of the component
        // to prevent conflict between the mouse position and the resizing
        if (
          resizable &&
          !mouseIsInsideBorder(coord, rectComponent) &&
          !mouseIsInsideBorder(coord, rectWaitEvent)
        ) {
          if (trace) {
            console.log(
              `[${WrappedComponent.name}] startDrag: mouse is NOT inside the border of the component event:`,
              event
            );
          }
          return false;
        }
        if (waitEvent && waitEvent.contains(event.target as Node)) {
          setCanMove(true);

          setMouseCoordinates(coord.x, coord.y);

          // difference between the mouse and the component
          offsetRef.current = getRectOffset(coord, {
            left: component.offsetLeft,
            top: component.offsetTop,
          });
          // console.log("start drag");
          event.stopPropagation();
          return true;
        }
        return false;
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
        /**
         * if where is a title bar, we need to move the component
         * when the mouse is down on the title bar
         */
        if (isLocked) return;

        if (startDrag(event, { x: event.clientX, y: event.clientY })) {
          // event.preventDefault();
        }
      };

      /**
       * When the mouse is up
       * @param {MouseEvent} event
       */
      const mouseUp = (event: MouseEvent) => {
        setCanMove(false);
        setMouseCoordinates(event.clientX, event.clientY);
        handleOnMove();
      };

      const handleMouseLeave = (event: MouseEvent) => {
        if (trace) console.log(`[${WrappedComponent.name}] mouseLeave`);
        if (canMove()) {
          mouseUp(event);
        }
      };

      /**
       * Touch events
       */
      const handleTouchStart = (event: TouchEvent) => {
        const touch = event.touches[0];
        if (trace) {
          console.log(
            `[${WrappedComponent.name}] touchStart, isLocked: ${isLocked}`
          );
        }
        if (isLocked) return;

        startDrag(event, {
          x: touch.clientX,
          y: touch.clientY,
        });
      };

      const handleTouchMove = (event: TouchEvent) => {
        const touch = event.touches[0];
        handleMove(event, {
          x: touch.clientX,
          y: touch.clientY,
        } as MouseEvent);
      };

      /**
       * add the events listener
       */
      waitEvent.addEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
      waitEvent.addEventListener(EVENT.MOUSE_UP, mouseUp);
      waitEvent.addEventListener(EVENT.MOUSE_LEAVE, handleMouseLeave);
      waitEvent.addEventListener(EVENT.MOUSE_DOWN, mouseDown);
      waitEvent.addEventListener(EVENT.TOUCH_START, handleTouchStart);
      waitEvent.addEventListener(EVENT.TOUCH_MOVE, handleTouchMove);
      waitEvent.addEventListener(EVENT.TOUCH_END, mouseUp as EventListener);
      waitEvent.addEventListener(EVENT.TOUCH_CANCEL, mouseUp as EventListener);
      return () => {
        waitEvent.removeEventListener(EVENT.MOUSE_MOVE, handleMouseMove);
        waitEvent.removeEventListener(EVENT.MOUSE_UP, mouseUp);
        waitEvent.removeEventListener(EVENT.MOUSE_DOWN, mouseDown);
        waitEvent.removeEventListener(EVENT.TOUCH_START, handleTouchStart);
        waitEvent.removeEventListener(EVENT.TOUCH_MOVE, handleTouchMove);
        waitEvent.removeEventListener(
          EVENT.TOUCH_END,
          mouseUp as EventListener
        );
        waitEvent.removeEventListener(
          EVENT.TOUCH_CANCEL,
          mouseUp as EventListener
        );
      };
    }, [isLocked, withTitleBar]);

    useEffect(() => {
      styleRef.current = { ...style };
      if (trace) {
        console.log(`[${WrappedComponent.name}] useEffect`, styleRef.current);
      }
    }, [style]);

    return (
      <div
        ref={componentRef}
        id={id}
        style={{ ...styleRef.current }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => onClick?.(e)}
        className={clsx("hover:z-30", className, {
          "h-fit": resizable,
          "group/draggable": !withTitleBar || titleHidden,
          "group/resizable": resizable,
          "border-grey-800 cursor-pointer border shadow-lg": canMove(),
          "cursor-move": !(isLocked || withTitleBar),
          "cursor-default": isLocked || withTitleBar,
        })}
      >
        <WithResizing
          componentRef={componentRef}
          componentName={`[${WrappedComponent.name}]`}
          isLocked={isLocked}
          resizable={resizable}
          trace={trace}
          minWidth={minWidth}
          minHeight={minHeight}
          maxWidth={maxWidth}
          maxHeight={maxHeight}
          {...props}
        >
          <WrappedComponent
            trace={trace ? "true" : undefined}
            {...(props as P)}
          />
          <TitleBar
            id={idKey}
            ref={titleRef}
            style={{
              height: titleHeight,
              transform: titleHidden ? "none" : "translateY(-100%)",
              ...(titleBackground
                ? {
                    backgroundColor: titleBackground,
                    color: getContrastColor(titleBackground),
                  }
                : {}),
            }}
            className={clsx("group-hover/draggable:z-40", titleClassName, {
              "bg-primary rounded border border-gray-500 text-secondary":
                titleClassName === null && withTitleBar,
              "group/draggable": withTitleBar && !titleHidden,
              "bg-transparent": !withTitleBar,
              "invisible group-hover/draggable:visible":
                withTitleBar && titleHidden,
              "opacity-60": withTitleBar && titleHidden && !isLocked,
              "opacity-80":
                withTitleBar && titleHidden && (withMinimize || withMaximize),
              "opacity-10": withTitleBar && titleHidden && isLocked,
              "cursor-move": withTitleBar && !isLocked,
            })}
            isLocked={isLocked}
            toggleLocked={withToggleLock ? toggleLocked : undefined}
            withMinimize={withMinimize}
            withMaximize={withMaximize}
            close={close}
          >
            {titleText}
          </TitleBar>
        </WithResizing>
      </div>
    );
  };
}
