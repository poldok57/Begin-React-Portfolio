import React, { useState, useEffect, useRef } from "react";

import {
  mouseIsInsideComponent,
  mouseIsInsideBorderComponent,
  getRectOffset,
} from "../../lib/mouse-position";
import { creatPlaceholder } from "../../lib/component-move";
import { TitleBar } from "./TitleBar";
import { WithResizing } from "./WithResizing";
import { generateRandomKey } from "./store";
import { getContrastColor } from "../../lib/utils/colors";
import { isAlignedRight, isAlignedBottom } from "../../lib/utils/position";

import clsx from "clsx";

import { Coordinate } from "../../lib/canvas/types";
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

        const { component } = selectComponent();
        // if the component is resizable, we need to check if the mouse is inside the border of the component
        // to prevent conflict between the mouse position and the resizing
        if (
          resizable &&
          !mouseIsInsideBorderComponent(event, component) &&
          !mouseIsInsideBorderComponent(event, waitEvent)
        ) {
          return;
        }
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
      <div
        ref={componentRef}
        id={id}
        style={{ ...styleRef.current }}
        className={clsx("hover:z-30", className, {
          "h-fit": resizable,
          "group/draggable": !titleBar || titleHidden,
          "group/resizable": resizable,
          "border-grey-800 cursor-pointer border shadow-lg": canMove(),
          "cursor-move": !(isLocked || titleBar),
          "cursor-default": isLocked || titleBar,
        })}
      >
        <WithResizing
          componentRef={componentRef}
          isLocked={isLocked}
          resizable={resizable}
          trace={trace}
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
              "cursor-move": titleBar && !isLocked,
            })}
            isLocked={isLocked}
            toggleLocked={toggleLocked}
            withMinimize={withMinimize}
            withMaximize={withMaximize}
            close={close}
          >
            {title}
          </TitleBar>
        </WithResizing>
      </div>
    );
  };
}
