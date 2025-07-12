import { zeroPoint } from ".";
import { EPSILON } from "../constants";
import type { Point } from "../types";

export const crossProduct = (p1: Point, p2: Point): number => {
  return p1.x * p2.y - p1.y * p2.x;
};

export const dotProduct = (p1: Point, p2: Point): number => {
  return p1.x * p2.x + p1.y * p2.y;
};

export const angleBetween = (
  p1: Point,
  p2: Point,
  degrees: boolean = false,
  clockwise: boolean = false
): number => {
  let radians = Math.atan2(crossProduct(p1, p2), dotProduct(p1, p2));

  if (radians < 0) {
    radians += 2 * Math.PI;
  }

  if (clockwise) {
    radians = 2 * Math.PI - radians;
  }

  if (degrees) {
    return (radians * 180) / Math.PI;
  }

  return radians;
};

export const subtractPoints = (p1: Point, p2: Point): Point => {
  return { x: p1.x - p2.x, y: p1.y - p2.y };
};

export const multiplyPoints = (p1: Point, p2: Point): Point => {
  return { x: p1.x * p2.x, y: p1.y * p2.y };
};

export const multiplyPointScalar = (p1: Point, n: number): Point => {
  return { x: p1.x * n, y: p1.y * n };
};

export const addPoints = (p1: Point, p2: Point): Point => {
  return { x: p1.x + p2.x, y: p1.y + p2.y };
};

export const normalize = (p: Point) => {
  const length = Math.sqrt(p.x * p.x + p.y * p.y);

  if (length === 0) {
    return zeroPoint();
  }

  const x = p.x / length;
  const y = p.y / length;

  return {
    x:
      Math.abs(x) - EPSILON <= 0
        ? 0
        : Math.abs(x) + EPSILON >= 1
        ? Math.sign(x) * 1
        : x,
    y:
      Math.abs(y) - EPSILON <= 0
        ? 0
        : Math.abs(y) + EPSILON >= 1
        ? Math.sign(y) * 1
        : y,
  };
};

export const rotatePoint = (
  p: Point,
  angle: number,
  clockwise: boolean = false,
  angleInDegrees: boolean = false
): Point => {
  const fullCircle = angleInDegrees ? 360 : 2 * Math.PI;
  let normalizedAngle = angle % fullCircle;
  if (normalizedAngle < 0) {
    normalizedAngle += fullCircle;
  }

  const radians = angleInDegrees
    ? (normalizedAngle * Math.PI) / 180
    : normalizedAngle;

  const dir = clockwise ? -1 : 1;

  const cos = Math.cos(radians);
  const sin = Math.sin(radians) * dir;

  return {
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos,
  };
};

export const distance = (p1: Point, p2: Point): number => {
  const diff = subtractPoints(p2, p1);

  return diff.x ** 2 + diff.y ** 2;
};

export const pointLength = (p1: Point): number => {
  return p1.x ** 2 + p1.y ** 2;
};

export const mapCanvasToLeftBottomZeroCoordinates = (point: Point) => {
  return { x: point.x, y: document.documentElement.offsetHeight - point.y };
};

