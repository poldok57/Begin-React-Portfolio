import { useState, useRef, useEffect } from "react";
import { isTouchDevice } from "@/lib/utils/device";
import { ThingsToDraw } from "@/lib/canvas/canvas-defines";

interface UseDragAndDropProps {
  designElements: ThingsToDraw[];
  orderDesignElement: (id: string, direction: 1 | -1) => void;
  onDragEnd: () => void;
}

export const useDragAndDrop = ({
  designElements,
  orderDesignElement,
  onDragEnd,
}: UseDragAndDropProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const dragItemRef = useRef<HTMLSpanElement | null>(null);

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
      const targetId = element?.getAttribute("data-id");

      if (!draggedItem || !targetId || draggedItem === targetId) return;

      const draggedIndex = designElements.findIndex(
        (el) => el.id === draggedItem
      );
      const targetIndex = designElements.findIndex((el) => el.id === targetId);

      if (draggedIndex < targetIndex) {
        orderDesignElement(draggedItem, 1);
      } else {
        orderDesignElement(draggedItem, -1);
      }
    };

    const handleDragEndMouse = (_e: Event) => {
      setDraggedItem(null);
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
      if (dragItemRef.current) {
        dragItemRef.current.style.opacity = "0.5";
      }
    };

    const handleTouchMove = (e: Event) => {
      e.preventDefault();
      const touchEvent = e as TouchEvent;

      if (!draggedItem || touchStartYRef.current === null) return;

      const touch = touchEvent.touches[0];
      const touchY = touch.clientY;
      const deltaY = touchY - touchStartYRef.current;

      const elementUnderTouch = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );
      const listItem = elementUnderTouch?.closest("li");
      const targetId = listItem?.getAttribute("data-id");

      if (targetId && targetId !== draggedItem && Math.abs(deltaY) > 20) {
        const draggedIndex = designElements.findIndex(
          (el) => el.id === draggedItem
        );
        const targetIndex = designElements.findIndex(
          (el) => el.id === targetId
        );

        if (draggedIndex < targetIndex && deltaY > 0) {
          orderDesignElement(draggedItem, 1);
        } else if (draggedIndex > targetIndex && deltaY < 0) {
          orderDesignElement(draggedItem, -1);
        }

        touchStartYRef.current = touchY;
      }
    };

    const handleTouchEnd = () => {
      if (dragItemRef.current) {
        dragItemRef.current.style.opacity = "1";
      }
      setDraggedItem(null);
      touchStartYRef.current = null;
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
