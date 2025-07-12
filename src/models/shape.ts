import type { Point } from "../types";

export abstract class Shape {
  points: Point[];

  constructor(points: Point[] = []) {
    this.points = points;
  }
}
