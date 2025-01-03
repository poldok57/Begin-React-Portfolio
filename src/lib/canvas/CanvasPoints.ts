/**
 * @module canvas-points (abstract class)
 * @description
 * this interface is used to manage data of a points to draw free hand or lines or path on a canvas
 */

import { drawDashedRectangle } from "@/lib/canvas/canvas-dashed-rect";
import { Coordinate, Area, LinePath, ArgsMouseOnShape } from "./types";
import {
  ParamsGeneral,
  CanvasPointsData,
  DRAWING_MODES,
} from "./canvas-defines";
import {
  topRightPosition,
  BORDER,
  topRightPositionOver,
  isOnButton,
  isBorder,
  mousePointer,
} from "../mouse-position";
import { drawCornerButton, drawCornerButtonDelete } from "./canvas-buttons";
import { isOnSquareBorder } from "@/lib/square-position";
import { throttle } from "@/lib/utils/throttle";
import { CanvasDrawableObject } from "./CanvasDrawableObject";
import { showCanvasImage } from "./canvas-elements";
import { scaledSize } from "../utils/scaledSize";
import { drawArrow } from "./canvas-arrow";
import { isTouchDevice } from "../utils/device";

export const MARGIN = 10;
const DEFAULT_OPACITY = 0.5;
const MIN_DISTANCE = 3;
const MIN_DISTANCE2 = MIN_DISTANCE ** 2;

export abstract class CanvasPoints extends CanvasDrawableObject {
  protected data: CanvasPointsData;

  protected angleFound: number;
  protected coordFound: number;
  protected lastMousePosition: Coordinate | null;
  protected lastButtonOpacity: number = DEFAULT_OPACITY;
  protected isFinished: boolean = false;
  protected isClosed: boolean = false;
  protected maxLineWidth: number = 0;
  protected canvasImage: HTMLCanvasElement | null = null;
  protected hasChanged = {
    position: false,
    draw: false,
  };
  protected realSize: Area | null = null;
  protected trueSize: boolean = true;
  protected arrowArea: Area | null = null;

  constructor() {
    super();
    this.angleFound = -1;
    this.coordFound = -1;
    this.lastMousePosition = null;
    this.isFinished = false;

    this.data = {
      id: "",
      type: "",
      rotation: 0,
      size: { x: 0, y: 0, width: 0, height: 0 },
      general: {
        color: "#000",
        lineWidth: 1,
        opacity: 1,
      },
      items: [],
    };
  }

  getData(): CanvasPointsData | null {
    if (!this.data.items || this.data.items.length <= 1) {
      return null;
    }
    this.realSize = null; // ready for next drawing
    return { ...this.data };
  }

  setData(data: CanvasPointsData, toEdit: boolean = false) {
    this.data = { ...data };
    if (toEdit) {
      this.data.size = { ...data.size };
      if (this.data.type !== DRAWING_MODES.DRAW) {
        this.data.items = data.items.map((item) => ({ ...(item as LinePath) }));
      }
      this.data.general = { ...data.general };
      if (data.path && data.path.filled) {
        this.data.path = { ...data.path };
      }
    }
    this.hasChanged = { position: false, draw: false };
    this.canvasImage = null;
    if (this.isPathClosed()) {
      this.isClosed = true;
    }
    this.realSize = this.getArea();
    this.isFinished = true;

    this.arrowArea = null;
  }

  setParamsGeneral(params: ParamsGeneral) {
    const previousParams = this.data.general;
    this.data.general = { ...this.data.general, ...params };
    if (this.data.general.lineWidth !== previousParams.lineWidth) {
      this.maxLineWidth = this.data.general.lineWidth;
      this.hasChanged.draw = true;
      this.hasChanged.position = true;
    }
    // Check if any property of data.general has changed
    if (
      previousParams.color !== this.data.general.color ||
      previousParams.lineWidth !== this.data.general.lineWidth ||
      previousParams.opacity !== this.data.general.opacity
    ) {
      this.hasChanged.draw = true;
    }
  }

  setHasChanged(type: "position" | "draw", hasChanged: boolean = true) {
    this.hasChanged[type] = hasChanged;
  }

  startArea(firstElement: LinePath | Coordinate) {
    if (this.maxLineWidth <= 1) {
      this.maxLineWidth = this.data.general.lineWidth;
    }

    let coord: Coordinate;
    if ("end" in firstElement && firstElement.end) {
      coord = { ...(firstElement.end as Coordinate) };
    } else {
      coord = { ...(firstElement as Coordinate) };
    }
    if ("lineWidth" in firstElement && firstElement.lineWidth) {
      this.maxLineWidth = Math.max(firstElement.lineWidth, this.maxLineWidth);
    }

    const widthLine = this.maxLineWidth / 2 + 1;

    this.canvasImage = null;
    this.realSize = null;
    this.data.size = {
      x: coord.x - widthLine,
      y: coord.y - widthLine,
      width: 2 * widthLine,
      height: 2 * widthLine,
    };
    this.isFinished = false;
    this.isClosed = false;
    this.trueSize = true;
    // console.log("startArea", this.data.size);
  }

  addPointInArea(coord: Coordinate, control: Coordinate | null = null) {
    if (!this.data.size) {
      return;
    }

    if (this.data.type === DRAWING_MODES.ARROW) {
      return;
    }

    const lineWidth = this.maxLineWidth / 2 + 1;
    const previousSize = { ...this.data.size };
    const size = this.data.size;
    const width = Math.max(size.width, coord.x + lineWidth, control?.x ?? 0);
    const height = Math.max(size.height, coord.y + lineWidth, control?.y ?? 0);

    size.x = size.x + Math.min(0, coord.x - lineWidth, control?.x ?? Infinity);
    size.y = size.y + Math.min(0, coord.y - lineWidth, control?.y ?? Infinity);

    // if elarge at right or bottom
    size.width = width;
    size.height = height;

    // if elarge
    if (previousSize.x !== size.x || previousSize.y !== size.y) {
      this.hasChanged.position = true;
      const offset = {
        x: previousSize.x - size.x,
        y: previousSize.y - size.y,
      };
      size.width += offset.x;
      size.height += offset.y;
      this.calculateRelativePositions(offset);
    }
  }

  /**
   * Add an item to the data
   * @param item - The item to add
   */
  addItem(item: LinePath | Coordinate) {
    // Check if the item is the same as the previous item
    const prevItem = this.data.items[this.data.items.length - 1];
    let prevPoint: Coordinate | null = null;
    let newPoint: Coordinate | null = null;

    if (prevItem && "end" in prevItem && prevItem.end) {
      prevPoint = (prevItem as LinePath).end as Coordinate;
    }
    // Verify if the current item is of type Coordinate
    else if (prevItem && "x" in prevItem && "y" in prevItem) {
      prevPoint = prevItem as Coordinate;
    }

    if ("end" in item && item.end) {
      newPoint = { ...((item as LinePath).end as Coordinate) };
    } else if ("x" in item && "y" in item) {
      newPoint = { ...(item as Coordinate) };
    }
    if (!newPoint) {
      return false;
    }
    // relative to the area
    newPoint.x -= this.data.size.x;
    newPoint.y -= this.data.size.y;

    if (prevPoint && newPoint) {
      // distance^2 < MIN_DISTANCE^2
      const distance2 =
        (prevPoint.x - newPoint.x) ** 2 + (prevPoint.y - newPoint.y) ** 2;
      if (distance2 < MIN_DISTANCE2) {
        return false; // Ignore adding the current item if it's the same as the previous item
      }
    }

    if ("end" in item && (item as LinePath).end) {
      (item as LinePath).end = newPoint;

      // if lineWidth is defined => update maxLineWidth
      if (
        "lineWidth" in item &&
        item.lineWidth &&
        this.maxLineWidth < item.lineWidth
      ) {
        this.maxLineWidth = item.lineWidth;
      }

      let control: Coordinate | null = null;
      if ("coordinates" in item && item.coordinates) {
        control = item.coordinates;
        control.x -= this.data.size.x;
        control.y -= this.data.size.y;
      }

      // Add the item to the data
      this.data.items.push(item as LinePath & Coordinate);
      if (this.data.items.length > 1) {
        // add the new point to the area
        this.addPointInArea(newPoint, control);
        // warning the lineWidth is defined at the second point
        if (this.data.items.length === 2) {
          const firstPoint = (this.data.items[0] as LinePath).end;
          if (firstPoint) {
            this.addPointInArea(firstPoint);
          }
        }
      }
    } else {
      // Add the item to the data
      this.data.items.push(newPoint as LinePath & Coordinate);

      this.addPointInArea(newPoint);
    }
    this.angleFound = -1;

    this.hasChanged.draw = true;
    return true;
  }

  getFirstItem() {
    const firstItem = this.data.items[0];
    if ("end" in firstItem && firstItem.end) {
      return firstItem.end as Coordinate;
    }
    return firstItem as Coordinate;
  }

  getLastItem() {
    if (this.data.items.length > 0) {
      return this.data.items[this.data.items.length - 1];
    }
    return null;
  }

  getLastPosition(): Coordinate | null {
    const lastItem = this.getLastItem();
    if (!lastItem) {
      return null;
    }
    let lastCoord: Coordinate | null = null;
    if ("end" in lastItem && lastItem.end) {
      lastCoord = { ...(lastItem.end as Coordinate) };
    } else {
      lastCoord = { ...(lastItem as Coordinate) };
    }
    lastCoord.x += this.data.size.x;
    lastCoord.y += this.data.size.y;
    return lastCoord;
  }

  isPathClosed() {
    if (this.data.items.length <= 1) {
      return false;
    }
    const firstItem = this.data.items[0];
    const lastItem = this.data.items[this.data.items.length - 1];

    if (
      !firstItem ||
      !("end" in firstItem && firstItem.end) ||
      !lastItem ||
      !("end" in lastItem && lastItem.end)
    ) {
      return false;
    }

    const firstCoord = (firstItem as LinePath).end as Coordinate;
    const lastCoord = (lastItem as LinePath).end as Coordinate;
    const distance2 =
      (firstCoord.x - lastCoord.x) ** 2 + (firstCoord.y - lastCoord.y) ** 2;
    return distance2 < MARGIN ** 2;
  }

  cancelLastItem() {
    if (this.data.items.length > 0) {
      this.data.items.pop();
      // Recalculate the rectangle after removing the last line
      this.data.size = this.getArea();
      this.angleFound = -1;
      this.coordFound = -1;
      this.hasChanged.draw = true;
      this.isClosed = false;
      return true;
    }
    return false;
  }

  setFinished(isFinished: boolean) {
    this.isFinished = isFinished;
    this.data.size = this.getArea();
  }

  getItemsLength() {
    return this.data.items.length || 0;
  }

  protected calculateRelativePositions(offset: Coordinate) {
    this.data.items.forEach((line) => {
      if ("end" in line && line.end) {
        line.end.x += offset.x;
        line.end.y += offset.y;
      }
      if ("coordinates" in line && line.coordinates) {
        line.coordinates.x += offset.x;
        line.coordinates.y += offset.y;
      }
      if ("x" in line && "y" in line) {
        line.x += offset.x;
        line.y += offset.y;
      }
    });
    this.hasChanged.position = false;
  }

  /**
   * Get the border of the arrow
   * @returns The border of the arrow
   */
  protected getArrowBorder() {
    const coord0 = (this.data.items[0] as LinePath).end;
    const line: LinePath = this.data.items[1] as LinePath;
    const coord1 = line.end;

    if (coord0 && coord1) {
      if (this.arrowArea === null) {
        this.arrowArea = drawArrow({
          ctx: null,
          from: coord0,
          to: coord1,
          lineWidth: line.lineWidth ?? this.data.general.lineWidth,
          padding: line.padding ?? 0,
          headSize: line.headSize ?? 10,
          curvature: line.curvature ?? 0.2,
        });
      }

      const borderRight = coord0.x > coord1.x ? 0 : 1;
      const borderTop = coord0.y < coord1.y ? 0 : 1;

      return {
        left: this.arrowArea.x,
        top: this.arrowArea.y,
        right: this.arrowArea.x + this.arrowArea.width,
        bottom: this.arrowArea.y + this.arrowArea.height,
        borderRight,
        borderTop,
      };
    }

    return {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      borderRight: 0,
      borderTop: 0,
    };
  }
  /**
   * Get the area of the points
   * @param insidePoint - The point inside the area
   * @returns The area of the points
   */
  protected getArea(): Area {
    let left = Infinity;
    let top = Infinity;
    let right = 0;
    let bottom = 0;

    let borderRight = 0;
    let borderTop = 0;
    let maxLineWidth = this.data.general.lineWidth;
    const previousSize = { ...this.data.size };

    // Find the maximum line width
    this.data.items.forEach((line) => {
      if ("lineWidth" in line && line.lineWidth) {
        maxLineWidth = Math.max(maxLineWidth, line.lineWidth);
      }
    });

    maxLineWidth = Math.round(maxLineWidth / 2) + 2;

    if (this.data.type === DRAWING_MODES.ARROW && this.data.items.length > 1) {
      // special case for arrow
      ({ left, top, right, bottom, borderRight, borderTop } =
        this.getArrowBorder());
    } else {
      this.data.items.forEach((line, index) => {
        const coord: Coordinate | null =
          "end" in line ? (line.end as Coordinate) : (line as Coordinate);

        if (coord) {
          left = Math.min(left, coord.x - maxLineWidth);
          top = Math.min(top, coord.y - maxLineWidth);
          right = Math.max(right, coord.x + maxLineWidth);
          bottom = Math.max(bottom, coord.y + maxLineWidth);
          if (right === coord.x + maxLineWidth) {
            borderRight = index;
          }
          if (top === coord.y - maxLineWidth) {
            borderTop = index;
          }
          if ("coordinates" in line && line.coordinates) {
            left = Math.min(left, line.coordinates.x);
            top = Math.min(top, line.coordinates.y);
            right = Math.max(right, line.coordinates.x);
            bottom = Math.max(bottom, line.coordinates.y);
          }
        }
      });
    }

    const expectedMargin = isTouchDevice() ? 4 * MARGIN : 3 * MARGIN;
    // upper right corner let place between the line and corner button
    const pRight = this.data.items[borderRight];
    if (pRight && "end" in pRight && pRight.end) {
      // if the top right corner is equal to coord, increase size.x by 15
      if (pRight.end.y < top + expectedMargin) {
        top = pRight.end.y - expectedMargin;
      }
    }

    const pTop = this.data.items[borderTop];
    if (pTop && "end" in pTop && pTop.end) {
      if (pTop.end.x >= right - expectedMargin) {
        top = Math.min(top, pTop.end.y - expectedMargin);
      }
    }
    // new size
    const x = Math.round(this.data.size.x + left);
    const y = Math.round(this.data.size.y + top);
    const width = Math.round(right - left);
    const height = Math.round(bottom - top);

    // check if the position has changed
    if (previousSize.x !== x || previousSize.y !== y) {
      this.hasChanged.position = true;
      this.calculateRelativePositions({
        x: previousSize.x - x,
        y: previousSize.y - y,
      });
      this.hasChanged.draw = true;
    }
    // check if the draw has changed
    if (previousSize.width !== width || previousSize.height !== height) {
      this.hasChanged.draw = true;
    }

    this.realSize = { x, y, width, height };
    // console.log("get-Area", this.realSize);
    return this.realSize;
  }

  eraseResizing() {
    this.trueSize = true;
    this.data.size = this.getArea();
  }

  drawCornerButtons(
    ctx: CanvasRenderingContext2D | null,
    mouseOnRectangle: string | null
  ) {
    if (!ctx || !this.data.size) {
      return;
    }
    // scale the size of the path
    const size = scaledSize(this.data.size, this.scale);

    const badge = topRightPosition(size, ctx.canvas.width, ctx.canvas.height);
    if (badge) {
      const opacity =
        mouseOnRectangle === BORDER.ON_BUTTON ? 1 : DEFAULT_OPACITY;
      const radius = opacity === 1 ? badge.radius * 1.6 : badge.radius;
      drawCornerButton(ctx, badge.centerX, badge.centerY, radius, opacity);
      this.lastButtonOpacity = opacity;
    }
    const btnDel = topRightPositionOver(
      size,
      ctx.canvas.width,
      ctx.canvas.height
    );
    if (btnDel) {
      const opacity =
        mouseOnRectangle === BORDER.ON_BUTTON_DELETE ? 1 : DEFAULT_OPACITY;
      const radius = opacity === 1 ? btnDel.radius * 1.6 : btnDel.radius;
      drawCornerButtonDelete(
        ctx,
        btnDel.centerX,
        btnDel.centerY,
        radius,
        opacity
      );
    }
  }

  clearAreaOnCanvas(ctx: CanvasRenderingContext2D | null) {
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  isInArea(coord: Coordinate): boolean {
    if (!this.data.size || !coord) {
      return false;
    }
    return (
      coord.x >= this.data.size.x &&
      coord.x <= this.data.size.x + this.data.size.width &&
      coord.y >= this.data.size.y &&
      coord.y <= this.data.size.y + this.data.size.height
    );
  }

  /**
   * Find the same angle in the path (used as cache search twice)
   * @param coord - the coordinate to find
   * @returns true if the angle is found, false otherwise
   */
  private lastCallTime: number = 0;
  findSameAnge(coord: Coordinate): boolean {
    const currentTime = Date.now();
    if (currentTime - this.lastCallTime > 100) {
      this.lastCallTime = currentTime;
      return false;
    }
    this.lastCallTime = currentTime;

    const marginPlus = MARGIN * 2;
    // Verify found angle with marginPlus
    if (this.angleFound >= 0) {
      const element = (this.data.items[this.angleFound] as LinePath).end;
      if (element) {
        return (
          Math.abs(element.x - coord.x) < marginPlus &&
          Math.abs(element.y - coord.y) < marginPlus
        );
      }
    }

    if (this.coordFound >= 0) {
      const element = (this.data.items[this.coordFound] as LinePath)
        .coordinates;

      if (element)
        return (
          Math.abs(element.x - coord.x) < marginPlus &&
          Math.abs(element.y - coord.y) < marginPlus
        );
    }
    return false;
  }

  findAngle(coordonate: Coordinate): boolean {
    // Vérifier le point de départ
    // Cash controle

    // find angle only if the path is not resized
    if (!this.trueSize) {
      return false;
    }

    const coord = {
      x: coordonate.x - this.data.size.x,
      y: coordonate.y - this.data.size.y,
    };

    if (this.angleFound >= 0 && this.findSameAnge(coord)) {
      return true;
    }

    // Verify end of each line
    for (let i = 0; i < this.data.items.length; i++) {
      const line = this.data.items[i];
      if ("end" in line && line.end) {
        if (
          Math.abs(coord.x - line.end.x) < MARGIN &&
          Math.abs(coord.y - line.end.y) < MARGIN
        ) {
          this.angleFound = i;
          this.coordFound = -1;
          return true;
        }
      }
      if ("coordinates" in line && line.coordinates) {
        if (
          Math.abs(coord.x - line.coordinates.x) < MARGIN &&
          Math.abs(coord.y - line.coordinates.y) < MARGIN
        ) {
          this.coordFound = i;
          this.angleFound = -1;
          return true;
        }
      }
    }
    // no angle found
    this.angleFound = -1;
    this.coordFound = -1;
    return false;
  }

  eraseAngleCoordFound() {
    this.angleFound = -1;
    this.coordFound = -1;
  }

  move(offset: Coordinate) {
    if (this.data.size) {
      this.data.size.x += offset.x;
      this.data.size.y += offset.y;
    }
    this.angleFound = -1;
    this.coordFound = -1;
  }

  mouseDown(
    ctx: CanvasRenderingContext2D | null,
    mousePosition: Coordinate
  ): string | null {
    this.lastMousePosition = mousePosition;
    if (this.data.size) {
      const mouseOnRectangle = this.handleMouseOnRectange(ctx, mousePosition);
      if (!mouseOnRectangle) {
        return null;
      }
      if (isOnButton(mouseOnRectangle) || isBorder(mouseOnRectangle)) {
        return mouseOnRectangle;
      }
    }
    return null;
  }

  /**
   * Throttle move path
   */
  throttleMovePath = throttle(
    (ctx: CanvasRenderingContext2D | null, newMousePosition: Coordinate) => {
      if (this.lastMousePosition) {
        const coord = { ...newMousePosition } as Coordinate;
        coord.x = Math.round(coord.x - this.lastMousePosition.x);
        coord.y = Math.round(coord.y - this.lastMousePosition.y);
        this.clearAreaOnCanvas(ctx);
        this.move(coord);
        this.draw(ctx, true);
        this.lastMousePosition = newMousePosition;
      }
    },
    25
  );

  moveAngle(coord: Coordinate) {
    const newCoord = {
      x: Math.round(coord.x - this.data.size.x),
      y: Math.round(coord.y - this.data.size.y),
    };

    if (this.angleFound === 0) {
      const firstItem = this.data.items[0] as LinePath;
      firstItem.end = { ...newCoord };

      // first angle on a closed path => move first and last points
      if (this.isClosed) {
        const lastItem = this.getLastItem() as LinePath;
        lastItem.end = { ...newCoord };
      }
      this.hasChanged.draw = true;
    }
    // clic on an angle
    else if (
      this.angleFound >= 0 &&
      this.angleFound <= this.data.items.length
    ) {
      const line = this.data.items[this.angleFound];
      if ("end" in line) {
        line.end = newCoord;
      } else {
        (line as Coordinate).x = newCoord.x;
        (line as Coordinate).y = newCoord.y;
      }
      this.hasChanged.draw = true;
    }
    // clic on a coord (for arcs)
    else if (this.coordFound > 0 && this.coordFound <= this.data.items.length) {
      const line = this.data.items[this.coordFound];
      if ("coordinates" in line) {
        line.coordinates = newCoord;
      }
      this.hasChanged.draw = true;
    }
    if (this.hasChanged.draw) {
      this.data.size = this.getArea();
    }
    return this.hasChanged.draw;
  }

  mouseOverPath(
    ctx: CanvasRenderingContext2D | null,
    event: MouseEvent | TouchEvent | null,
    mousePosition: Coordinate,
    resizingBorder: string | null = null
  ) {
    if (!ctx) {
      return "none";
    }
    if (resizingBorder && !this.findAngle(mousePosition)) {
      // mouse is over a border, we can resize the path

      const newArea = this.resizingArea(
        ctx,
        mousePosition,
        false,
        resizingBorder
      );
      if (newArea) {
        this.setDataSize(newArea);
        this.clearAreaOnCanvas(ctx);
        this.draw(ctx, true);
      }
      return mousePointer(resizingBorder);
    }

    let cursorType = "default";
    let inArea = false;
    if (this.isInArea(mousePosition)) {
      // action after the path is closed
      cursorType = "move";
      inArea = true;
    }
    const btnPressed =
      event === null
        ? false
        : event instanceof MouseEvent
        ? event.buttons === 1
        : event instanceof TouchEvent
        ? event.touches.length > 0
        : false;

    if ((btnPressed || inArea) && this.findAngle(mousePosition)) {
      cursorType = "pointer";
      if (btnPressed) {
        this.clearAreaOnCanvas(ctx);
        this.moveAngle(mousePosition);
        this.draw(ctx, true);
        if (event) {
          event.preventDefault();
        }
      }
    } else if (btnPressed && inArea && this.lastMousePosition) {
      if (event) {
        event.preventDefault();
      }
      this.throttleMovePath(ctx, mousePosition);
      cursorType = "grabbing";
    } else {
      const mouseOnRectangle = this.handleMouseOnRectange(ctx, mousePosition);
      if (
        mouseOnRectangle === BORDER.ON_BUTTON ||
        mouseOnRectangle === BORDER.ON_BUTTON_DELETE
      ) {
        this.drawCornerButtons(ctx, mouseOnRectangle);
        cursorType = "pointer";
      } else if (this.lastButtonOpacity !== DEFAULT_OPACITY) {
        this.clearAreaOnCanvas(ctx);
        this.draw(ctx, true);
      } else if (mouseOnRectangle && isBorder(mouseOnRectangle)) {
        cursorType = mousePointer(mouseOnRectangle);
      }
    }
    return cursorType;
  }

  handleMouseOnRectange(
    ctx: CanvasRenderingContext2D | null,
    mousePosition: Coordinate
  ): string | null {
    if (!this.data.size || !ctx || !mousePosition) {
      return null;
    }

    return isOnSquareBorder({
      coordinate: mousePosition,
      area: this.data.size,
      withResize: true,
      withCornerButton: true,
      withTurningButtons: false,
      maxWidth: ctx.canvas.width / this.scale,
      maxHeight: ctx.canvas.height / this.scale,
    } as ArgsMouseOnShape);
  }

  abstract drawLines(_ctx: CanvasRenderingContext2D | null): boolean;
  // for implement add infos on the canvas
  drawAddingInfos(_ctx: CanvasRenderingContext2D | null): void {}

  draw(
    ctx: CanvasRenderingContext2D | null,
    withDashedRectangle: boolean = true
  ): boolean {
    if (!ctx || !this.data.items || this.data.items.length <= 1) {
      return false;
    }
    this.trueSize = false;
    if (
      this.realSize &&
      this.realSize.width === this.data.size.width &&
      this.realSize.height === this.data.size.height
    ) {
      this.trueSize = true;
    }
    if (this.hasChanged.position) {
      this.data.size = this.getArea();
    }
    // draw the path in a temporyCanvas
    if (this.hasChanged.draw || !this.canvasImage) {
      if (!this.canvasImage) {
        this.canvasImage = document.createElement("canvas");
      }
      if (!this.realSize || !this.isFinished) {
        this.realSize = { ...this.data.size };
        this.trueSize = true;
      }

      this.canvasImage.width = this.realSize.width;
      this.canvasImage.height = this.realSize.height;
      // console.log("draw", this.data.size);

      const ctxTemp = this.canvasImage.getContext("2d");
      if (ctxTemp) {
        // console.log("draw realSize", this.realSize, "data:", this.data.size);
        ctxTemp.clearRect(0, 0, this.realSize.width, this.realSize.height);
        ctxTemp.lineCap = ctx.lineCap;
        ctxTemp.lineJoin = ctx.lineJoin;
        if (!this.drawLines(ctxTemp)) {
          return false;
        }
        this.hasChanged.draw = false;
      }
    }

    // scale the size of the path
    const size = scaledSize(this.data.size, this.scale);

    // console.log("scale", this.scale, "type", this.data.type, "draw", size);
    if (this.canvasImage) {
      // draw the canvasImage with the reduced size
      showCanvasImage(ctx, size, this.canvasImage);
    }

    if (
      !withDashedRectangle ||
      this.data.items.length <= 1 ||
      !this.data.size
    ) {
      return false;
    }

    if (this.trueSize) {
      // adding infos on the canvas, if there is no resize
      this.drawAddingInfos(ctx);
    }
    drawDashedRectangle(ctx, size, 0.3);

    if (this.isFinished) {
      this.drawCornerButtons(ctx, null);
    }

    return true;
  }
}
