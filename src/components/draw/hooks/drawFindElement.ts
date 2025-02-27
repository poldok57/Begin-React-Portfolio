import { Coordinate } from "../../../lib/canvas/types";
import { drawingHandler, returnMouseDown } from "./drawingHandler";

import {
  DRAWING_MODES,
  AllParams,
  ThingsToDraw,
  DRAW_TYPE,
} from "../../../lib/canvas/canvas-defines";
import { showAllDashedRectangles } from "@/lib/canvas/showDrawElement";
import { isInsideSquare } from "@/lib/square-position";
import { debounceThrottle } from "@/lib/utils/debounce";
import { MouseCircle } from "./MouseCircle";

import { CanvasDrawableObject } from "@/lib/canvas/CanvasDrawableObject";
import { clearCanvasByCtx } from "@/lib/canvas/canvas-tools";
import { CanvasFreeCurve } from "@/lib/canvas/CanvasFreeCurve";
import { CanvasShape } from "@/lib/canvas/CanvasShape";
import { CanvasPath } from "@/lib/canvas/CanvasPath";

/**
 * DrawLine class , manager all actions to draw a line on the canvas
 */
export class drawFindElement extends drawingHandler {
  protected nbFound: number;
  private designElements: ThingsToDraw[];
  private setSelectedDesignElement: (elementId: string) => void;
  private mouseCircle: MouseCircle;
  private getAllDesignElements: () => ThingsToDraw[];
  private drawers: Map<string, CanvasDrawableObject> = new Map();
  private modifiedElements: Set<string> = new Set();

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
    this.getAllDesignElements =
      this.designStore.getState().getAllDesignElements;

    this.designElements = this.getAllDesignElements();
    this.mouseCircle = new MouseCircle();
    this.mouseCircle.setParams({
      color: "#aaaaff",
      radius: 40,
      globalAlpha: 0.3,
      filled: true,
    });
  }

  setType(type: string) {
    this.type = type;
    if (type === DRAWING_MODES.FIND) {
      this.designElements = this.getAllDesignElements();
    }
  }

  // setDataGeneral(_dataGeneral: unknown) {}

  changeData(_data: AllParams): void {}

  setDraw(_draw: unknown) {}

  getDraw(): null {
    return null;
  }

  /**
   * Get the drawer for the given type
   * @param type
   * @returns
   */
  getDrawer(type: string): CanvasDrawableObject | undefined {
    let canvasObject: CanvasDrawableObject;
    switch (type) {
      case DRAW_TYPE.DRAW:
        canvasObject = new CanvasFreeCurve();
        break;
      case DRAW_TYPE.LINES_PATH:
      case DRAW_TYPE.ARROW:
        canvasObject = new CanvasPath(null);
        break;
      default:
        canvasObject = new CanvasShape();
        break;
    }
    return canvasObject;
  }

  async refreshDrawing() {
    if (!this.context) return;

    // Get the latest list of elements
    this.designElements = this.getAllDesignElements();

    // For each element, create or get a drawer
    for (const element of this.designElements) {
      let drawer = this.drawers.get(element.id);

      // If it's the first display or if the element has been modified
      if (!drawer) {
        drawer = this.getDrawer(element.type);
        if (drawer) {
          this.drawers.set(element.id, drawer);
        }
        element.modified = true;
      }
    }

    // load elements if modified
    await Promise.all(
      this.designElements.map(async (element) => {
        if (element.modified) {
          const drawer = this.drawers.get(element.id);
          if (drawer) {
            await drawer.setData(element);
          }
        }
      })
    );

    // Clear the canvas
    clearCanvasByCtx(this.context);
    // draw elements
    Array.from(this.drawers.values()).forEach((drawer) => {
      drawer.draw(this.context);
    });

    // Clean drawers that are no longer used
    const currentIds = new Set(this.designElements.map((e) => e.id));
    Array.from(this.drawers.keys()).forEach((id) => {
      if (!currentIds.has(id)) {
        this.drawers.delete(id);
      }
    });

    // Cleear the flag "modifed" for elements in the store
    this.designStore.getState().designElements.forEach((element) => {
      element.modified = undefined;
    });
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

    this.debounceShowAllDashedRectangles(
      this.ctxTemporary,
      this.designElements,
      {
        x: coord.x,
        y: coord.y,
      },
      this.scale
    );
    this.mouseCircle.setPosition(event);

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
      this.mouseCircle.hide();
    }
  }

  endAction() {
    if (this.getType() === DRAWING_MODES.FIND) {
      this.clearTemporaryCanvas();
      this.mouseCircle.hide();
    }
  }
}
