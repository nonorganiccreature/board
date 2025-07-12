import type { Rect } from "../types";
import { extractRectanglePoints } from "../utils/points";
import { Shape } from "./shape";

export class Rectangle extends Shape {
  rect: Rect = { size: { width: 1, height: 1 }, position: { x: 1, y: 1 } };

  constructor(rectangle: Rect) {
    super(extractRectanglePoints(rectangle));
    this.rect = rectangle;
  }
}
