import { hatchedCircle } from "@/lib/canvas/canvas-basic";

export interface MouseCircleParams {
  x?: number;
  y?: number;
  radius?: number;
  color?: string;
  globalAlpha?: number;
  filled?: boolean;
  lineWidth?: number;
}

export interface PencilPointParams {
  diameter: number;
  color: string;
  globalAlpha?: number;
  hatched?: boolean;
}

export class MouseCircle {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private maxRadius: number = 0;
  private params: MouseCircleParams;
  private pencilPointParams: PencilPointParams | null = null;
  private withPencilPoint: boolean = false;

  constructor() {
    this.params = {
      x: document.body.clientWidth / 2,
      y: document.body.clientHeight / 2,
      radius: 5,
      color: "#808080",
      globalAlpha: 0.5,
      filled: false,
      lineWidth: 1,
    };
  }

  private createCanvas(radius: number) {
    if (radius > this.maxRadius || !this.canvas) {
      const canvas = document.createElement("canvas");
      document.body.appendChild(canvas);
      canvas.width = radius * 2;
      canvas.height = radius * 2;
      this.ctx = canvas.getContext("2d");
      this.canvas = canvas;
      if (!this.ctx) {
        throw new Error("Failed to create canvas context");
      }

      const canvasStyle = this.canvas.style;
      canvasStyle.position = "fixed";
      canvasStyle.top = "0";
      canvasStyle.left = "0";
      canvasStyle.pointerEvents = "none";
      canvas.style.display = "none";
      canvas.style.zIndex = "1001";

      this.maxRadius = radius;
    }
  }

  private drawCirle() {
    if (!this.params.radius || !this.params.color) return;

    if (!this.ctx) {
      this.createCanvas(this.params.radius);
    } else if (this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (!this.ctx) return;

    this.ctx.beginPath();
    if (this.params.globalAlpha) {
      this.ctx.globalAlpha = this.params.globalAlpha;
    }

    this.ctx.arc(
      this.maxRadius,
      this.maxRadius,
      this.params.radius,
      0,
      Math.PI * 2
    );

    if (this.params.filled) {
      this.ctx.fillStyle = this.params.color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = this.params.color;
      this.ctx.lineWidth = this.params.lineWidth || 1;
      this.ctx.stroke();
    }
    this.ctx.closePath();

    if (this.withPencilPoint && this.pencilPointParams && this.ctx) {
      if (this.pencilPointParams.hatched) {
        hatchedCircle({
          context: this.ctx,
          coordinate: { x: this.maxRadius, y: this.maxRadius },
          color: this.pencilPointParams.color,
          borderColor: "#303030",
          diameter: this.pencilPointParams.diameter,
          globalAlpha: this.pencilPointParams.globalAlpha,
        });
        return;
      }
      this.ctx.lineWidth = this.pencilPointParams.diameter;
      this.ctx.strokeStyle = this.pencilPointParams.color;
      this.ctx.globalAlpha = this.pencilPointParams.globalAlpha || 0.5;
      this.ctx.fillStyle = this.pencilPointParams.color;
      this.ctx.lineCap = "round";
      // Draw the center point of the canvas
      this.ctx.beginPath();
      this.ctx.arc(
        this.maxRadius,
        this.maxRadius,
        this.ctx.lineWidth / 2,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
      this.ctx.closePath();
    }
  }

  private move() {
    if (!this.canvas || !this.params.x || !this.params.y) return;

    // Position the canvas so the circle center is at the target coordinates
    const left = this.params.x - this.maxRadius;
    const top = this.params.y - this.maxRadius;

    this.canvas.style.transform = `translate(${left}px, ${top}px)`;
    this.canvas.style.display = "block";
  }

  public setPencilPointParams(params: PencilPointParams) {
    this.withPencilPoint = true;

    if (
      this.pencilPointParams == null ||
      this.pencilPointParams.diameter !== params.diameter ||
      this.pencilPointParams.color !== params.color ||
      this.pencilPointParams.globalAlpha !== params.globalAlpha
    ) {
      this.pencilPointParams = params;
      this.drawCirle();
    }
  }

  public setWithPencilPoint(withPencilPoint: boolean) {
    if (this.withPencilPoint !== withPencilPoint) {
      this.withPencilPoint = withPencilPoint;
      this.drawCirle();
    }
  }

  public setParams(params: MouseCircleParams) {
    if (
      this.params.color === params.color &&
      this.params.radius === params.radius &&
      this.params.globalAlpha === params.globalAlpha &&
      this.params.filled === params.filled &&
      this.params.lineWidth === params.lineWidth
    ) {
      return;
    }
    this.params = { ...this.params, ...params };
    if (params.radius) {
      this.drawCirle();
    }
  }

  public setPosition(event: MouseEvent | TouchEvent) {
    if (event instanceof MouseEvent) {
      this.params.x = event.clientX;
      this.params.y = event.clientY;
    } else if (event instanceof TouchEvent) {
      this.params.x = event.touches[0].clientX;
      this.params.y = event.touches[0].clientY;
    }
    this.move();
  }

  public hide() {
    if (this.canvas) {
      this.canvas.style.display = "none";
    }
  }

  public clear() {
    if (this.canvas) {
      document.body.removeChild(this.canvas);
      this.canvas = null;
      this.ctx = null;
      this.maxRadius = 0;
      this.pencilPointParams = null;
    }
  }
}
