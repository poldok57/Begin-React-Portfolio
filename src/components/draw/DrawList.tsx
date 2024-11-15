import { useDesignStore } from "@/lib/stores/design";
import { showDrowElement } from "./hooks/showDrowElement";
import { X, RefreshCcw } from "lucide-react";

export const DrawList = ({
  canvasRef,
  canvasTemporyRef,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement> | null;
  canvasTemporyRef: React.RefObject<HTMLCanvasElement> | null;
}) => {
  const designStore = useDesignStore();
  const deleteDesignElement = designStore.deleteDesignElement;
  let designElements = designStore.designElements;

  const handleShowElement = (elementId: string) => {
    if (!canvasRef || !canvasRef.current) return;

    const ctx = canvasTemporyRef?.current?.getContext("2d");
    const element = designElements.find((element) => element.id === elementId);
    if (!ctx || !element) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    showDrowElement(ctx, element, true);
  };

  const handleDeleteElement = (elementId: string) => {
    deleteDesignElement(elementId);

    designElements = designElements.filter(
      (element) => element.id !== elementId
    );

    redraw();
  };

  const redraw = () => {
    if (!canvasRef || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    designElements.forEach((element) => {
      showDrowElement(ctx, element, false);
    });
  };

  return (
    <div className="flex overflow-auto flex-col gap-2 p-4 w-48 max-h-96 rounded-md border-2 bg-background border-accent">
      {designElements.length === 0 ? (
        <p className="italic text-gray-500">Empty list</p>
      ) : (
        <>
          <button
            onClick={redraw}
            className="self-end btn btn-sm btn-circle hover:bg-gray-50"
          >
            <RefreshCcw size={16} />
          </button>
          <ul className="space-y-2">
            {designElements.map((element) => (
              <li
                key={element.id}
                className="flex justify-between items-center p-1 bg-gray-50 rounded"
              >
                <span
                  className="px-2 w-full text-sm border cursor-pointer"
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
