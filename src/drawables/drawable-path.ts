import { CONNECTION_LINE_WIDTH } from "../constants";
import type { Drawable } from "../interfaces";
import { Path } from "../models";
import type { Point } from "../types";
import { mapCanvasToLeftBottomZeroCoordinates } from "../utils";

export class DrawablePath extends Path implements Drawable {
  color: string;

  constructor(points: Point[], color: string) {
    super(points);
    this.color = color;
  }

  draw(drawer: CanvasRenderingContext2D): undefined {
    const { x, y } = mapCanvasToLeftBottomZeroCoordinates(this.points[0]);
    drawer.beginPath();
    drawer.moveTo(x, y);

    for (let i = 1; i < this.points.length; i++) {
      const { x, y } = mapCanvasToLeftBottomZeroCoordinates(this.points[i]);
      drawer.lineTo(x, y);
    }

    drawer.lineWidth = CONNECTION_LINE_WIDTH
    drawer.strokeStyle = this.color;
    drawer.stroke();
  }
}
