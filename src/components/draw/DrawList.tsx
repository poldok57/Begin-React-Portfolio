"use client";
import { useEffect, useState } from "react";
import { useDesignStore } from "@/lib/stores/design";
import { showDrawElement } from "../../lib/canvas/showDrawElement";
import { X, RefreshCcw } from "lucide-react";
import { DRAWING_MODES } from "@/lib/canvas/canvas-defines";

export const DrawList = ({
  canvasRef,
  canvasTemporyRef,
  setMode,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement> | null;
  canvasTemporyRef: React.RefObject<HTMLCanvasElement> | null;
  setMode: (mode: string) => void;
}) => {
  const { designElements, deleteDesignElement, refreshCanvas } =
    useDesignStore();
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  const handleShowElement = (elementId: string) => {
    if (!canvasTemporyRef || !canvasTemporyRef.current) return;
    const ctx = canvasTemporyRef.current.getContext("2d");
    const element = designElements.find((element) => element.id === elementId);
    if (!ctx || !element) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    showDrawElement(ctx, element, true);
  };

  const refresh = () => {
    if (canvasTemporyRef?.current) {
      const tmpcan = canvasTemporyRef.current;
      const tempCtx = tmpcan.getContext("2d");
      tempCtx?.clearRect(0, 0, tmpcan.width, tmpcan.height);
    }

    refreshCanvas(ctx);
  };

  const handleDeleteElement = (elementId: string) => {
    deleteDesignElement(elementId);
    refresh();
  };

  useEffect(() => {
    setCtx(canvasRef?.current?.getContext("2d") ?? null);
  }, [canvasRef?.current]);

  return (
    <div
      onMouseEnter={() => setMode(DRAWING_MODES.PAUSE)}
      className="flex overflow-auto flex-col gap-2 p-4 w-48 max-h-96 rounded-md border-2 bg-background border-accent"
    >
      {designElements.length === 0 ? (
        <p className="italic text-gray-500">Empty list</p>
      ) : (
        <>
          <button
            onClick={refresh}
            className="self-end btn btn-sm btn-circle hover:bg-gray-50"
          >
            <RefreshCcw size={16} />
          </button>
          <ul className="space-y-2">
            {designElements.map((element) => (
              <li
                key={element.id}
                className="flex justify-between items-center p-1 rounded"
                style={{ backgroundColor: element.general.color }}
              >
                <span
                  className="px-2 w-full text-sm bg-gray-50 border cursor-pointer"
                  onClick={() => handleShowElement(element.id)}
                >
                  {element.type}
                </span>

                <button
                  onClick={() => handleDeleteElement(element.id)}
                  className="p-1 text-xs bg-red-400 btn btn-sm btn-circle hover:bg-red-500"
                  title="Delete element"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
