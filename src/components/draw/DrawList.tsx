"use client";
import { useEffect, useState } from "react";
import { useDesignStore } from "@/lib/stores/design";
import { showDrawElement } from "../../lib/canvas/showDrawElement";
import { X, RefreshCcw, GripVertical } from "lucide-react";
import {
  CanvasPointsData,
  DRAWING_MODES,
  ShapeDefinition,
} from "@/lib/canvas/canvas-defines";
import { DeleteWithConfirm } from "../atom/DeleteWithConfirm";
import { cn } from "@/lib/utils/cn";
export const DrawList = ({
  canvasRef,
  canvasTemporyRef,
  setMode,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement> | null;
  canvasTemporyRef: React.RefObject<HTMLCanvasElement> | null;
  setMode: (mode: string) => void;
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

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleShowElement = (elementId: string) => {
    if (!canvasTemporyRef || !canvasTemporyRef.current) return;
    const ctxTmp = canvasTemporyRef.current.getContext("2d");
    const element = designElements.find((element) => element.id === elementId);
    if (!ctxTmp || !element) return;

    ctxTmp.clearRect(0, 0, ctxTmp.canvas.width, ctxTmp.canvas.height);
    showDrawElement(ctxTmp, element, true);
    setSelectedDesignElement(elementId);

    refreshCanvas(ctx, false);
    setMode(DRAWING_MODES.RELOAD);
  };

  const refresh = () => {
    if (canvasTemporyRef?.current) {
      const tmpcan = canvasTemporyRef.current;
      const tempCtx = tmpcan.getContext("2d");
      tempCtx?.clearRect(0, 0, tmpcan.width, tmpcan.height);
    }
    refreshCanvas(ctx, true);
  };

  const handleDeleteElement = (elementId: string) => {
    deleteDesignElement(elementId);
    refresh();
  };

  const handleReset = () => {
    eraseDesignElement();
    refresh();
  };

  const handleDragStart = (elementId: string) => {
    setDraggedItem(elementId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

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

  const handleDragEnd = () => {
    setDraggedItem(null);
    refresh();
  };

  useEffect(() => {
    setCtx(canvasRef?.current?.getContext("2d") ?? null);
  }, [canvasRef?.current]);

  return (
    <div
      onMouseDown={() => setMode(DRAWING_MODES.PAUSE)}
      className="flex flex-col gap-3 py-2 w-44 rounded-md border-2 bg-background border-accent"
    >
      {designElements.length === 0 ? (
        <p className="italic text-gray-500">Empty list</p>
      ) : (
        <>
          <div className="flex overflow-auto flex-col gap-1 p-2 max-h-96">
            <ul className="space-y-2">
              {designElements.map(
                (element: CanvasPointsData | ShapeDefinition) => (
                  <li
                    key={element.id}
                    className={cn(
                      "flex justify-between items-center p-1 rounded group",
                      {
                        "outline outline-secondary outline-2 outline-offset-2":
                          element.id === selectedDesignElement,
                      }
                    )}
                    style={{ backgroundColor: element.general.color }}
                  >
                    <div className="flex gap-1 items-center w-full">
                      <span
                        draggable
                        onDragStart={() => handleDragStart(element.id)}
                        onDragOver={(e) => handleDragOver(e, element.id)}
                        onDragEnd={handleDragEnd}
                        className="cursor-grab active:cursor-ns-resize"
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
                        onClick={() => handleShowElement(element.id)}
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
          <div className="flex justify-between items-center">
            <button
              onClick={refresh}
              className="self-end btn btn-sm btn-circle hover:bg-gray-50"
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
