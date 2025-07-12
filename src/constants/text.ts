import type { Rect } from "../types";

export const connectionAngleNotPerpendicularErrorText = (
  angle: number | string,
  rect: Rect
) =>
  `Заданный угол ${angle}° прямоугольника ${JSON.stringify(rect)} подсоединения не перпендикулярен грани`;
