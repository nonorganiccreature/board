export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type Rect = {
  position: Point; // координата центра прямоугольника
  size: Size;
};

export type ConnectionPoint = {
  point: Point;
  angle: number; // угол в градусах
};