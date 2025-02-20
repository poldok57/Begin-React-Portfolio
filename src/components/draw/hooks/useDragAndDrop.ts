import { useState, useRef, useEffect } from "react";
import { isTouchDevice } from "@/lib/utils/device";
import { ThingsToDraw } from "@/lib/canvas/canvas-defines";

interface UseDragAndDropProps {
  designElements: ThingsToDraw[];
  orderDesignElement: (currentIndex: number, targetIndex: number) => void;
  onDragEnd: () => void;
}

export const useDragAndDrop = ({
  designElements,
  orderDesignElement,
  onDragEnd,
}: UseDragAndDropProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const targetIdRef = useRef<string | null>(null);

  const touchStartYRef = useRef<number | null>(null);
  const dragItemRef = useRef<HTMLSpanElement | null>(null);
  const ghostElementRef = useRef<HTMLElement | null>(null);

  const recordTargetId = (element: HTMLLIElement) => {
    const targetId = element?.getAttribute("data-id");

    if (!draggedItem || !targetId) return false;

    targetIdRef.current = targetId;
    return true;
  };

  const moveElement = () => {
    if (
      !targetIdRef.current ||
      !draggedItem ||
      draggedItem === targetIdRef.current
    )
      return false;

    const draggedIndex = designElements.findIndex(
      (el) => el.id === draggedItem
    );
    const targetIndex = designElements.findIndex(
      (el) => el.id === targetIdRef.current
    );

    if (draggedIndex !== -1 && targetIndex !== -1) {
      orderDesignElement(draggedIndex, targetIndex);
      return true;
    }
    return false;
  };

  const createGhostElement = (element: HTMLElement, x: number, y: number) => {
    const ghost = element.closest("li")?.cloneNode(true) as HTMLElement;
    if (!ghost) return;

    ghost.style.position = "fixed";
    ghost.style.top = `${y}px`;
    ghost.style.left = `${x}px`;
    ghost.style.width = `${element.closest("li")?.offsetWidth}px`;
    ghost.style.opacity = "0.6";
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "1000";
    ghost.style.transform = "translateY(-50%)";

    document.body.appendChild(ghost);
    ghostElementRef.current = ghost;
  };

  const moveGhostElement = (x: number, y: number) => {
    if (ghostElementRef.current) {
      ghostElementRef.current.style.top = `${y}px`;
      ghostElementRef.current.style.left = `${x}px`;
    }
  };

  const removeGhostElement = () => {
    if (ghostElementRef.current) {
      ghostElementRef.current.remove();
      ghostElementRef.current = null;
    }
  };

  useEffect(() => {
    const isTouch = isTouchDevice();
    const listItems = document.querySelectorAll(".draggable-item");

    const handleDragStartMouse = (e: Event) => {
      const dragEvent = e as DragEvent;
      const element = (dragEvent.target as HTMLElement).closest("li");
      const elementId = element?.getAttribute("data-id");
      if (!elementId) return;
      setDraggedItem(elementId);
    };

    const handleDragOverMouse = (e: Event) => {
      const dragEvent = e as DragEvent;
      dragEvent.preventDefault();
      const element = (dragEvent.target as HTMLElement).closest("li");
      if (element) {
        recordTargetId(element as HTMLLIElement);
      }
    };

    const handleDragEndMouse = (_e: Event) => {
      moveElement();
      setDraggedItem(null);
      targetIdRef.current = null;
      onDragEnd();
    };

    const handleTouchStart = (e: Event) => {
      const touchEvent = e as TouchEvent;
      const element = (touchEvent.target as HTMLElement).closest("li");
      const elementId = element?.getAttribute("data-id");

      if (!elementId) return;

      touchEvent.preventDefault();
      setDraggedItem(elementId);
      touchStartYRef.current = touchEvent.touches[0].clientY;

      // create ghost element
      createGhostElement(
        touchEvent.target as HTMLElement,
        touchEvent.touches[0].clientX,
        touchEvent.touches[0].clientY
      );
    };

    const handleTouchMove = (e: Event) => {
      e.preventDefault();
      const touchEvent = e as TouchEvent;

      if (!draggedItem || touchStartYRef.current === null) return;

      const touch = touchEvent.touches[0];
      moveGhostElement(touch.clientX, touch.clientY);

      const elementUnderTouch = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );
      const listItem = elementUnderTouch?.closest("li");

      if (recordTargetId(listItem as HTMLLIElement)) {
        touchStartYRef.current = touch.clientY;
      }
    };

    const handleTouchEnd = () => {
      removeGhostElement();
      moveElement();
      setDraggedItem(null);
      touchStartYRef.current = null;
      targetIdRef.current = null;
      onDragEnd();
    };

    if (isTouch) {
      listItems.forEach((item) => {
        item.addEventListener("touchstart", handleTouchStart as EventListener, {
          passive: false,
        });
        item.addEventListener("touchmove", handleTouchMove as EventListener, {
          passive: false,
        });
        item.addEventListener("touchend", handleTouchEnd as EventListener, {
          passive: false,
        });
      });
    } else {
      listItems.forEach((item) => {
        item.setAttribute("draggable", "true");
        item.addEventListener(
          "dragstart",
          handleDragStartMouse as EventListener
        );
        item.addEventListener("dragover", handleDragOverMouse as EventListener);
        item.addEventListener("dragend", handleDragEndMouse as EventListener);
      });
    }

    return () => {
      if (isTouch) {
        listItems.forEach((item) => {
          item.removeEventListener(
            "touchstart",
            handleTouchStart as EventListener
          );
          item.removeEventListener(
            "touchmove",
            handleTouchMove as EventListener
          );
          item.removeEventListener("touchend", handleTouchEnd as EventListener);
        });
      } else {
        listItems.forEach((item) => {
          item.removeEventListener(
            "dragstart",
            handleDragStartMouse as EventListener
          );
          item.removeEventListener(
            "dragover",
            handleDragOverMouse as EventListener
          );
          item.removeEventListener(
            "dragend",
            handleDragEndMouse as EventListener
          );
        });
      }
    };
  }, [draggedItem, designElements, orderDesignElement, onDragEnd]);

  return {
    draggedItem,
    dragItemRef,
  };
};
