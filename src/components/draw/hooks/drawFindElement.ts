import { Coordinate } from "../../../lib/canvas/types";
import { drawingHandler, returnMouseDown } from "./drawingHandler";

import {
  DRAWING_MODES,
  AllParams,
  ThingsToDraw,
} from "../../../lib/canvas/canvas-defines";
import { showAllDashedRectangles } from "@/lib/canvas/showDrawElement";
import { isInsideSquare } from "@/lib/square-position";

/**
 * DrawLine class , manager all actions to draw a line on the canvas
 */
export class drawFindElement extends drawingHandler {
  private nbFound = 0;
  private designElements: ThingsToDraw[];
  private setSelectedDesignElement: (elementId: string) => void;
  private refreshCanvas: (
    ctx: CanvasRenderingContext2D | null | undefined,
    withSelected?: boolean
  ) => void;

  constructor(
    canvas: HTMLCanvasElement,
    canvasContext: CanvasRenderingContext2D | null,
    temporyCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void,
    localStorageName?: string | null
  ) {
    super(canvas, canvasContext, temporyCanvas, setMode, localStorageName);
    this.extendedMouseArea = false;

    this.setSelectedDesignElement =
      this.designStore.getState().setSelectedDesignElement;
    this.refreshCanvas = this.designStore.getState().refreshCanvas;

    this.designElements = this.designStore.getState().designElements;
  }

  initData(initData: AllParams): void {
    this.setType(initData.mode);
  }

  setType(type: string) {
    this.type = type;
    if (type === DRAWING_MODES.FIND) {
      this.designElements = this.designStore.getState().designElements;
    }
  }

  // setDataGeneral(_dataGeneral: unknown) {}

  changeData(_data: AllParams): void {}

  setDraw(_draw: unknown) {}

  getDraw(): null {
    return null;
  }

  refreshDrawing() {
    // console.log("refreshDrawing free curve");
    this.clearTemporyCanvas();
    this.refreshCanvas(this.context, true);
  }

  hightLightDrawing() {}

  /**
   * Function who recieve the mouse move event
   */
  actionMouseMove(
    event: MouseEvent | TouchEvent,
    coord: Coordinate
  ): string | null {
    if (this.getType() !== DRAWING_MODES.FIND) {
      return null;
    }

    if (!this.ctxTempory) return null;

    let cursor = "default";

    const nb = showAllDashedRectangles(
      this.ctxTempory,
      this.designElements,
      {
        x: coord.x,
        y: coord.y,
      },
      this.scale
    );

    if (nb !== this.nbFound) {
      this.nbFound = nb;
      if (nb > 0) {
        cursor = "pointer";
      }
    }
    return cursor;
  }

  /**
   * Function who recieve the mouse down event
   * to start drawing on the canvas.
   * @param {DRAWING_MODES} mode
   * @param {MouseEvent} event
   * @returns {boolean} to continue or not
   */
  actionMouseDown(
    event: MouseEvent | TouchEvent,
    coord: Coordinate
  ): returnMouseDown {
    if (this.getType() !== DRAWING_MODES.FIND) {
      return { toExtend: false } as returnMouseDown;
    }
    const designElements = this.designElements;

    for (let i = designElements.length - 1; i >= 0; i--) {
      const element = designElements[i];
      if (
        isInsideSquare(
          { x: coord.x, y: coord.y },
          element.size,
          element.rotation
        )
      ) {
        // console.log("Find Element actionMouseDown", element.type, element.id);
        this.setSelectedDesignElement(element.id);

        return {
          toExtend: false,
          pointer: "default",
          changeMode: DRAWING_MODES.RELOAD,
        } as returnMouseDown;
      }
    }

    return { toExtend: false, pointer: "pointer" } as returnMouseDown;
  }

  /**
   * Function to stop drawing on the canvas
   */
  actionMouseUp() {}

  actionMouseLeave() {
    if (this.getType() === DRAWING_MODES.FIND) {
      this.clearTemporyCanvas();
    }
  }

  endAction() {
    if (this.getType() === DRAWING_MODES.FIND) {
      this.clearTemporyCanvas();
    }
  }
}
