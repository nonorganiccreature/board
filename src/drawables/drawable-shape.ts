import type { Drawable } from "../interfaces";
import { Shape } from "../models";
import type { Point } from "../types";
import { addPoints, zeroPoint, mapToCanvasCoordinates } from "../utils";

export abstract class DrawableShape extends Shape implements Drawable {
  bgColor: string = "#000";

  translation: Point = zeroPoint();

  draw(drawer: CanvasRenderingContext2D): undefined {
    const { x, y } = mapToCanvasCoordinates(
      addPoints(this.points[0], this.translation)
    );

    drawer.beginPath();
    drawer.moveTo(x, y);

    for (let i = 1; i < this.points.length; i++) {
      const { x, y } = mapToCanvasCoordinates(
        addPoints(this.points[i], this.translation)
      );
      drawer.lineTo(x, y);
    }

    drawer.fillStyle = this.bgColor;
    drawer.fill();
  }
}
