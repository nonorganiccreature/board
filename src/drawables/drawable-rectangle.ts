import type { Drawable } from "../interfaces";
import type { ConnectionPoint, Point, Size } from "../types";

import { BORDER_WIDTH } from "../constants";
import { Rectangle } from "../models";
import { DrawableShape } from "./";
import { addPoints, zeroPoint, mapToCanvasCoordinates } from "../utils";
import { CONNECTION_POINT_SIZE } from "../constants";

export class DrawableRectangle extends DrawableShape implements Drawable {
  borderColor: string = "#000";

  connectionPointColor: string = "#3ef";
  connectionPoint: ConnectionPoint;

  model: Rectangle;

  connectionPointTranslation: Point = zeroPoint();

  constructor(
    rectangle: Rectangle,
    connectionPoint: ConnectionPoint,
    bgColor: string,
    borderColor: string,
    connectionPointColor: string
  ) {
    super(rectangle.points);

    this.borderColor = borderColor;
    this.bgColor = bgColor;
    this.connectionPointColor = connectionPointColor;
    this.connectionPoint = connectionPoint;
    this.model = rectangle;
  }

  draw(drawer: CanvasRenderingContext2D): undefined {
    const borderRectSize: Size = {
      width: this.model.rect.size.width + BORDER_WIDTH,
      height: this.model.rect.size.height + BORDER_WIDTH,
    };

    const reactangleCenter = mapToCanvasCoordinates(
      addPoints(this.model.rect.position, this.translation)
    );

    drawer.fillStyle = this.borderColor;
    drawer.fillRect(
      reactangleCenter.x - borderRectSize.width / 2,
      reactangleCenter.y - borderRectSize.height / 2,
      borderRectSize.width,
      borderRectSize.height
    );

    super.draw(drawer);

    const connectionPointCenter = mapToCanvasCoordinates(
      addPoints(this.connectionPoint.point, this.translation)
    );

    drawer.fillStyle = this.connectionPointColor;
    drawer.fillRect(
      connectionPointCenter.x - CONNECTION_POINT_SIZE / 2,
      connectionPointCenter.y - CONNECTION_POINT_SIZE / 2,
      CONNECTION_POINT_SIZE,
      CONNECTION_POINT_SIZE
    );
  }
}
