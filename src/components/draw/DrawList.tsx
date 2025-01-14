"use client";
import { useDesignStore } from "@/lib/stores/design";
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
import { clearCanvasByCtx } from "@/lib/canvas/canvas-tools";

export const DrawList = ({
  canvasRef,
  temporyCanvasRef,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null | undefined>;
  temporyCanvasRef: React.RefObject<HTMLCanvasElement | null | undefined>;
}) => {
  const {
    designElements,
    deleteDesignElement,
    eraseDesignElement,
    orderDesignElement,
    refreshCanvas,
    setSelectedDesignElement,
    selectedDesignElement,
  } = useDesignStore();

  const { setMode } = useDrawingContext();

  const onSelectElement = (elementId: string) => {
    setSelectedDesignElement(elementId);

    setMode(DRAWING_MODES.RELOAD);
  };

  const context = canvasRef.current?.getContext("2d", {
    willReadFrequently: true,
  });

  const refresh = () => {
    const temporyCtx = temporyCanvasRef.current?.getContext("2d");
    if (temporyCtx) {
      clearCanvasByCtx(temporyCtx);
    }

    refreshCanvas(context, true);
  };

  const handleDeleteElement = (elementId: string) => {
    deleteDesignElement(elementId);
    setMode(DRAWING_MODES.FIND);
    refresh();
  };

  const handleReset = () => {
    eraseDesignElement();
    refresh();
  };

  const { draggedItem, dragItemRef } = useDragAndDrop({
    designElements,
    orderDesignElement,
    onDragEnd: () => {
      refresh();
      setMode(DRAWING_MODES.FIND);
    },
  });

  return (
    <div
      // onMouseDown={() => setMode(DRAWING_MODES.PAUSE)}
      className="flex flex-col gap-3 py-2 w-44 rounded-md border-2 bg-background border-accent"
    >
      {designElements.length === 0 ? (
        <p className="italic text-center text-gray-500">Empty list</p>
      ) : (
        <>
          <div className="flex overflow-auto flex-col gap-1 p-2 max-h-96">
            <ul className="space-y-2">
              {designElements.map(
                (element: CanvasPointsData | ShapeDefinition) => (
                  <li
                    key={element.id}
                    data-id={element.id}
                    className={cn(
                      "flex justify-between items-center p-1 rounded group",
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
                    <div className="flex gap-1 items-center w-full">
                      <span
                        ref={dragItemRef}
                        className={cn(
                          "cursor-grab active:cursor-grabbing draggable-item",
                          {
                            "opacity-50": draggedItem === element.id,
                          }
                        )}
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
                refresh();
                setMode(DRAWING_MODES.FIND);
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
