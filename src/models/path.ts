import type { Point } from "../types";

export class Path {
  points: Point[];

  constructor(points: Point[] = []) {
    this.points = points;
  }
}
