import { DrawablePath, DrawableRectangle } from "../drawables";
import type { Drawable } from "../interfaces";
import type { ConnectionPoint, Point } from "../types";
import {
  addPoints,
  dataConverter,
  zeroPoint,
  extractRectangleEdges,
  extractRectanglePoints,
  findFirstIntersection,
  isEmptyPoint,
  subtractPoints,
} from "../utils";
import {
  angleBetween,
  normalize,
  rotatePoint,
} from "../utils";

export class Node {
  shape: Drawable;
  adjacentNode: Node | null = null;
  pathToAdjacentNode: DrawablePath | null = null;

  constructor(
    shape: Drawable,
    adjacentNode: Node | null,
    pathToAdjacentNode: DrawablePath | null
  ) {
    this.shape = shape;
    this.adjacentNode = adjacentNode;
    this.pathToAdjacentNode = pathToAdjacentNode;
  }

  assignTranslation(
    shapeTranslation: Point,
    connectionPointTranslation: Point
  ) {
    if (this.shape instanceof DrawableRectangle) {
      if (shapeTranslation) {
        this.shape.translation = shapeTranslation;
      }

      if (connectionPointTranslation) {
        this.shape.connectionPointTranslation = connectionPointTranslation;
      }
    }
  }

  initializePathToAdjecentNode() {
    if (
      this.adjacentNode &&
      this.shape instanceof DrawableRectangle &&
      this.adjacentNode.shape instanceof DrawableRectangle
    ) {
      const path = new DrawablePath(
        dataConverter(
          this.shape.model.rect,
          this.adjacentNode.shape.model.rect,
          this.shape.connectionPoint,
          this.adjacentNode.shape.connectionPoint
        ),
        "#3f9"
      );
      this.pathToAdjacentNode = path;
      this.adjacentNode.pathToAdjacentNode = path;
    }
  }

  createAdjacentNodePathWithTranslations() {
    if (
      this.adjacentNode &&
      this.shape instanceof DrawableRectangle &&
      this.adjacentNode.shape instanceof DrawableRectangle
    ) {
      // debugger;
      let connectionPointWithAppliedTranslation: ConnectionPoint = {
        point: addPoints(
          this.shape.connectionPoint.point,
          this.shape.translation
        ),
        angle: this.shape.connectionPoint.angle,
      };

      const rectanglePositionAppliedTranslation = {
        ...addPoints(this.shape.model.rect.position, this.shape.translation),
      };

      // if (!isEmptyPoint(this.shape.translation)) {
      // }

      if (!isEmptyPoint(this.shape.connectionPointTranslation)) {
        const connectionPointIntersection = findFirstIntersection(
          addPoints(
            this.shape.model.rect.position,
            this.shape.connectionPointTranslation
          ),
          this.shape.model.rect.position,
          extractRectangleEdges(this.shape.model.rect)
        );

        let angle = this.shape.connectionPoint.angle;
        if (connectionPointIntersection) {
          const intersectionVector = normalize(
            rotatePoint(
              normalize(
                subtractPoints(
                  connectionPointIntersection.segment[1],
                  connectionPointIntersection.segment[0]
                )
              ),
              90,
              false,
              true
            )
          );

          angle = angleBetween({ x: 1, y: 0 }, intersectionVector, true);

          connectionPointWithAppliedTranslation = {
            point: connectionPointIntersection.point,
            angle: angle,
          };

          connectionPointWithAppliedTranslation.point.x = Math.round(
            connectionPointWithAppliedTranslation.point.x
          );

          connectionPointWithAppliedTranslation.point.y = Math.round(
            connectionPointWithAppliedTranslation.point.y
          );

          this.shape.connectionPoint = connectionPointWithAppliedTranslation;
        }
      }

      const path = new DrawablePath(
        dataConverter(
          {
            ...this.shape.model.rect,
            position: rectanglePositionAppliedTranslation,
          },
          this.adjacentNode.shape.model.rect,
          connectionPointWithAppliedTranslation,
          this.adjacentNode.shape.connectionPoint
        ),
        "#3f9"
      );

      this.pathToAdjacentNode = path;
      this.adjacentNode.pathToAdjacentNode = path;
    }
  }

  commitTranslation() {
    if (this.shape instanceof DrawableRectangle) {
      let connectionPointWithAppliedTranslation: ConnectionPoint = {
        point: addPoints(
          this.shape.connectionPoint.point,
          this.shape.translation
        ),
        angle: this.shape.connectionPoint.angle,
      };

      const rectanglePositionAppliedTranslation = {
        ...addPoints(this.shape.model.rect.position, this.shape.translation),
      };

      if (!isEmptyPoint(this.shape.translation)) {
        this.shape.model.rect.position = rectanglePositionAppliedTranslation;
        this.shape.connectionPoint.point =
          connectionPointWithAppliedTranslation.point;
        this.shape.model.points = extractRectanglePoints(this.shape.model.rect);
        this.shape.points = extractRectanglePoints(this.shape.model.rect);
      }

      if (!isEmptyPoint(this.shape.connectionPointTranslation)) {
        const connectionPointIntersection = findFirstIntersection(
          addPoints(
            this.shape.model.rect.position,
            this.shape.connectionPointTranslation
          ),
          this.shape.model.rect.position,
          extractRectangleEdges(this.shape.model.rect)
        );

        let angle = this.shape.connectionPoint.angle;
        if (connectionPointIntersection) {
          const intersectionVector = normalize(
            rotatePoint(
              normalize(
                subtractPoints(
                  connectionPointIntersection.segment[1],
                  connectionPointIntersection.segment[0]
                )
              ),
              90,
              false,
              true
            )
          );

          angle = angleBetween({ x: 1, y: 0 }, intersectionVector, true);

          connectionPointWithAppliedTranslation = {
            point: connectionPointIntersection.point,
            angle: angle,
          };

          connectionPointWithAppliedTranslation.point.x = Math.round(
            connectionPointWithAppliedTranslation.point.x
          );

          connectionPointWithAppliedTranslation.point.y = Math.round(
            connectionPointWithAppliedTranslation.point.y
          );

          this.shape.connectionPoint = connectionPointWithAppliedTranslation;
        }
      }

      this.shape.translation = zeroPoint();
      this.shape.connectionPointTranslation = zeroPoint();
    }
  }
}
