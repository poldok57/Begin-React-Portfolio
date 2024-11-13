import { DRAWING_MODES } from "@/lib/canvas/canvas-defines";
import { isOnTurnButton } from "@/lib/mouse-position";

import { drawingShapeHandler } from "./drawingShapHandler";

export class drawElement extends drawingShapeHandler {
  constructor(
    canvas: HTMLCanvasElement,
    temporyCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void
  ) {
    super(canvas, temporyCanvas, setMode);

    if (!canvas) return;

    this.coordinates = { x: 0, y: 0 };
  }

  setType(type: string): void {
    this.shape.setType(type);
    if (type === DRAWING_MODES.TEXT) {
      this.setWithResize(false);
    } else {
      this.setWithResize(true);
    }
  }

  /// egalise the size of the square
  actionMouseDblClick(): void {
    // check position of the mouse, if mouse is on a button, do nothing
    if (!this.coordinates) return;
    const mouseOnShape = this.shape.handleMouseOnShape(
      this.mCanvas,
      this.coordinates
    );
    if (mouseOnShape && isOnTurnButton(mouseOnShape)) {
      return;
    }

    const size = this.shape.getDataSize();

    const diagonal = Math.sqrt(
      Math.pow(size.width, 2) + Math.pow(size.height, 2)
    );
    const newSize = diagonal / Math.sqrt(2);

    const centerX = size.x + size.width / 2;
    const centerY = size.y + size.height / 2;

    // center the square at same place
    this.shape.setDataSize({
      x: centerX - newSize / 2,
      y: centerY - newSize / 2,
      width: newSize,
      height: newSize,
    });

    // if the element is rond, set rotation to 0
    if (this.shape.getType() === DRAWING_MODES.CIRCLE) {
      this.shape.setRotation(0);
      this.shape.calculateWithTurningButtons();
    }

    this.shape.draw(this.ctxTempory, true, null);
  }
}
