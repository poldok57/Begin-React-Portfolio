import { Coordinate } from "../../../lib/canvas/types";
import { drawingHandler, returnMouseDown } from "./drawingHandler";

import {
  DRAWING_MODES,
  AllParams,
  ThingsToDraw,
  mouseCircle,
} from "../../../lib/canvas/canvas-defines";
import { showAllDashedRectangles } from "@/lib/canvas/showDrawElement";
import { isInsideSquare } from "@/lib/square-position";
import { debounceThrottle } from "@/lib/utils/debounce";
import { hightLightMouseCursor } from "@/lib/canvas/canvas-basic";
import { scaledCoordinate } from "@/lib/utils/scaledSize";

/**
 * DrawLine class , manager all actions to draw a line on the canvas
 */
export class drawFindElement extends drawingHandler {
  protected nbFound: number;
  private designElements: ThingsToDraw[];
  private setSelectedDesignElement: (elementId: string) => void;
  private refreshCanvas: (
    ctx: CanvasRenderingContext2D | null | undefined,
    withSelected?: boolean,
    scale?: number | null
  ) => void;

  constructor(
    canvas: HTMLCanvasElement,
    canvasContext: CanvasRenderingContext2D | null,
    temporaryCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void,
    localStorageName?: string | null
  ) {
    super(canvas, canvasContext, temporaryCanvas, setMode, localStorageName);
    this.extendedMouseArea = false;
    this.nbFound = 0;
    this.typeHandler = DRAWING_MODES.FIND;

    this.setSelectedDesignElement =
      this.designStore.getState().setSelectedDesignElement;
    this.refreshCanvas = this.designStore.getState().refreshCanvas;

    this.designElements = this.designStore.getState().designElements;
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
    this.clearTemporaryCanvas();
    this.refreshCanvas(this.context, true, this.scale);
  }

  hightLightDrawing() {}

  showAllDashedRectangles = (
    ctx: CanvasRenderingContext2D,
    elements: ThingsToDraw[],
    coord: Coordinate,
    scale: number
  ): void => {
    this.nbFound = showAllDashedRectangles(ctx, elements, coord, scale);
  };

  debounceShowAllDashedRectangles = debounceThrottle(
    (
      ctx: CanvasRenderingContext2D,
      elements: ThingsToDraw[],
      coord: Coordinate,
      scale: number
    ) => {
      this.showAllDashedRectangles(ctx, elements, coord, scale);
    },
    100,
    200
  );

  /**
   * Function who recieve the mouse move event
   */
  actionMouseMove(
    event: MouseEvent | TouchEvent,
    coord: Coordinate
  ): string | null {
    if (this.getType() !== DRAWING_MODES.FIND) {
      console.log("actionMouseMove type", this.getType());
      return null;
    }

    if (!this.ctxTemporary) {
      console.log("actionMouseMove No ctxTemporary");
      return null;
    }

    let cursor = "default";

    // if (this.nbFound > 0) {
    //   console.log("actionMouseMove", this.getType(), "nbFound", this.nbFound);
    // }

    this.debounceShowAllDashedRectangles(
      this.ctxTemporary,
      this.designElements,
      {
        x: coord.x,
        y: coord.y,
      },
      this.scale
    );
    if (this.ctxMouse) {
      this.clearMouseCanvas();
      const mouseCoord = scaledCoordinate(coord, this.scale);
      if (!mouseCoord) return null;
      hightLightMouseCursor(this.ctxMouse, mouseCoord, {
        ...mouseCircle,
        color: "#aaaaff60",
      });

      // this.blueCircle(this.ctxMouse, coord, this.scale);
    } else {
      console.log("actionMouseMove No ctxMouse");
    }

    if (this.nbFound > 0) {
      cursor = "pointer";
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
      this.clearTemporaryCanvas();
    }
  }

  endAction() {
    if (this.getType() === DRAWING_MODES.FIND) {
      this.clearTemporaryCanvas();
    }
  }
}
