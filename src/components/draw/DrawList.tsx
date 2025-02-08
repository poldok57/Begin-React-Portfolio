"use client";
import { useZustandDesignStore } from "@/lib/stores/design";
import { X, RefreshCcw, GripVertical } from "lucide-react";
import {
  CanvasPointsData,
  DRAWING_MODES,
  ShapeDefinition,
} from "@/lib/canvas/canvas-defines";
import { DeleteWithConfirm } from "../atom/DeleteWithConfirm";
import { cn } from "@/lib/utils/cn";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useDrawingContext } from "@/context/DrawingContext";

export const DrawList = ({
  className = "flex flex-col gap-3 py-2 w-44 rounded-md border-2 bg-background border-accent",
  storeName,
}: {
  className?: string;
  storeName?: string | null;
}) => {
  const store = useZustandDesignStore(storeName ?? null);
  if (!store) {
    throw new Error("Design store not found");
  }

  const designElementLength = store((state) => state.designElements.length);

  const {
    designElements,
    deleteDesignElement,
    eraseDesignElement,
    orderDesignElement,
    setSelectedDesignElement,
    selectedDesignElement,
  } = store.getState();

  const { setDrawingMode, addEventAction } = useDrawingContext();

  const onSelectElement = (elementId: string) => {
    setSelectedDesignElement(elementId);

    setDrawingMode(DRAWING_MODES.RELOAD);
  };

  const handleDeleteElement = (elementId: string) => {
    deleteDesignElement(elementId);
    handleRefresh();
    setDrawingMode(DRAWING_MODES.FIND);
  };

  const handleRefresh = () => {
    // console.log("refresh");
    addEventAction(DRAWING_MODES.REFRESH);
  };

  const handleReset = () => {
    eraseDesignElement();
    handleRefresh();
  };

  const { draggedItem, dragItemRef } = useDragAndDrop({
    designElements,
    orderDesignElement,
    onDragEnd: () => {
      handleRefresh();
      setDrawingMode(DRAWING_MODES.FIND);
    },
  });

  return (
    <div
      // onMouseDown={() => setDrawingMode(DRAWING_MODES.PAUSE)}
      className={cn("flex flex-col", className)}
    >
      {designElementLength === 0 ? (
        <p className="italic text-center text-gray-500">Empty list</p>
      ) : (
        <>
          <div className="flex overflow-auto flex-col gap-1 p-2 max-h-96">
            <ul className="p-0 m-0 space-y-1">
              {designElements.map(
                (element: CanvasPointsData | ShapeDefinition) => (
                  <li
                    key={element.id}
                    data-id={element.id}
                    className={cn(
                      [
                        "flex justify-between items-center p-1 rounded group draggable-item",
                        "p-1",
                      ],
                      {
                        "outline outline-secondary outline-2 outline-offset-2":
                          element.id === selectedDesignElement,
                      }
                    )}
                    style={{
                      backgroundColor:
                        element.type !== DRAWING_MODES.IMAGE
                          ? element.general.color
                          : undefined,
                    }}
                  >
                    <div className="flex gap-1 items-center p-0 w-full">
                      <span
                        ref={dragItemRef}
                        className={cn("cursor-grab active:cursor-grabbing", {
                          "opacity-50": draggedItem === element.id,
                        })}
                      >
                        <div className="p-1 bg-gray-50 rounded-md opacity-50 group-hover:opacity-80">
                          <GripVertical
                            size={16}
                            className="text-gray-700 opacity-50 group-hover:opacity-90"
                          />
                        </div>
                      </span>
                      <span
                        className="px-2 w-full text-sm truncate bg-gray-50 border cursor-pointer"
                        onClick={() => onSelectElement(element.id)}
                      >
                        {"text" in element &&
                        (("shape" in element && element?.shape?.withText) ||
                          element.type === DRAWING_MODES.TEXT)
                          ? element?.text?.text
                          : element.type}
                      </span>

                      <button
                        onClick={() => handleDeleteElement(element.id)}
                        className="p-1 text-xs bg-red-400 btn btn-xs btn-circle hover:bg-red-500"
                        title="Delete element"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="flex justify-between items-center px-2 mt-auto">
            <button
              onClick={() => {
                setSelectedDesignElement(null);
                handleRefresh();
                setDrawingMode(DRAWING_MODES.FIND);
              }}
              className="btn btn-sm btn-circle hover:bg-gray-50"
            >
              <RefreshCcw size={16} />
            </button>
            <DeleteWithConfirm
              position="top"
              align="end"
              className="w-20 bg-red-500 btn btn-sm hover:bg-red-600 border-primary"
              confirmClassName="w-28"
              confirmMessage="Erase your drawing?"
              onConfirm={handleReset}
            >
              Reset
            </DeleteWithConfirm>
          </div>
        </>
      )}
    </div>
  );
};
