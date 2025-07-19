import { CONNECTION_LINE_PADDING } from "../constants";
import { DrawablePath, DrawableRectangle } from "../drawables";
import type { Drawable } from "../interfaces";
import type { ConnectionPoint, Point, Rect, Segment } from "../types";
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
import { angleBetween, normalize, rotatePoint } from "../utils";

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
      const connectionPointWithAppliedTranslation: ConnectionPoint = {
        point: addPoints(
          this.shape.connectionPoint.point,
          this.shape.translation
        ),
        angle: this.shape.connectionPoint.angle,
      };

      const rectanglePositionAppliedTranslation = {
        ...addPoints(this.shape.model.rect.position, this.shape.translation),
      };

      if (!isEmptyPoint(this.shape.connectionPointTranslation)) {
        this.calculateMouseFromCenterEdgeIntersection();
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

  calculateMouseFromCenterEdgeIntersection() {
    if (
      this.adjacentNode &&
      this.shape instanceof DrawableRectangle &&
      this.adjacentNode.shape instanceof DrawableRectangle
    ) {
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

        const connectionPointWithAppliedTranslation: ConnectionPoint = {
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
  }

  intersectsWithNode(otherNode: Node): Array<Segment[]> | null {
    if (
      this.shape instanceof DrawableRectangle &&
      otherNode.shape instanceof DrawableRectangle
    ) {
      const thisRectanglePositionAppliedTranslation = {
        ...addPoints(this.shape.model.rect.position, this.shape.translation),
      };

      const thisRectangleWithPaddings: Rect = {
        size: {
          width: this.shape.model.rect.size.width + 2 * CONNECTION_LINE_PADDING,
          height:
            this.shape.model.rect.size.height + 2 * CONNECTION_LINE_PADDING,
        },
        position: thisRectanglePositionAppliedTranslation,
      };

      const otherNodeRectangleWithPaddings: Rect = {
        size: {
          width:
            otherNode.shape.model.rect.size.width + 2 * CONNECTION_LINE_PADDING,
          height:
            otherNode.shape.model.rect.size.height +
            2 * CONNECTION_LINE_PADDING,
        },
        position: otherNode.shape.model.rect.position,
      };

      const thisRectangleEdges = extractRectangleEdges(
        thisRectangleWithPaddings
      );

      const otherNodeRectangleEdges = extractRectangleEdges(
        otherNodeRectangleWithPaddings
      );

      const thisEdgesIntersectsOtherRectangle = [];

      for (const thisEdge of thisRectangleEdges) {
        if (
          findFirstIntersection(
            thisEdge[0],
            thisEdge[1],
            otherNodeRectangleEdges
          )
        ) {
          thisEdgesIntersectsOtherRectangle.push(thisEdge);
        }
      }

      const otherEdgeIntersectsThisRectangle = [];

      for (const otherEdge of otherNodeRectangleEdges) {
        if (
          findFirstIntersection(otherEdge[0], otherEdge[1], thisRectangleEdges)
        ) {
          otherEdgeIntersectsThisRectangle.push(otherEdge);
        }
      }

      if (
        thisEdgesIntersectsOtherRectangle.length > 0 &&
        otherEdgeIntersectsThisRectangle.length > 0
      ) {
        return [
          thisEdgesIntersectsOtherRectangle,
          otherEdgeIntersectsThisRectangle,
        ];
      }
    }

    return null;
  }

  changeConnectionPointPosition(intersectedPaddedEdges: Segment[]) {
    if (this.shape instanceof DrawableRectangle) {
      // debugger;
      const thisRectangleEdges = extractRectangleEdges(this.shape.model.rect);

      let freeEdge: Segment | null = null;
      for (const thisEdge of thisRectangleEdges) {
        freeEdge = thisEdge;

        const normalizedThisEdge = normalize(
          subtractPoints(thisEdge[1], thisEdge[0])
        );

        for (const intersectedEdge of intersectedPaddedEdges) {
          const normalizedIntersectedEdge = normalize(
            subtractPoints(intersectedEdge[1], intersectedEdge[0])
          );

          const angle = angleBetween(
            normalizedIntersectedEdge,
            normalizedThisEdge,
            true
          );

          if (angle === 0) {
            freeEdge = null;
            break;
          }
        }

        // Ребро прямоугольника не параллельно и не сонаправленно ни с одной граней буферного квадрата пересекающаяся с другим буферным квадратом

        if (freeEdge) {
          break;
        }
      }

      if (freeEdge) {
        const newAngle =
          angleBetween(
            { x: 1, y: 0 },
            rotatePoint(
              normalize(subtractPoints(freeEdge[1], freeEdge[0])),
              90,
              false,
              true
            ),
            true
          ) % 360;

        const newPosition: Point = {
          x: Math.round(freeEdge[0].x + freeEdge[1].x) / 2,
          y: Math.round(freeEdge[0].y + freeEdge[1].y) / 2,
        };

        this.shape.connectionPoint = { angle: newAngle, point: newPosition };
      }
    }
  }

  commitTranslation() {
    if (this.shape instanceof DrawableRectangle) {
      const connectionPointWithAppliedTranslation: ConnectionPoint = {
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
        this.calculateMouseFromCenterEdgeIntersection();
      }

      this.shape.translation = zeroPoint();
      this.shape.connectionPointTranslation = zeroPoint();
    }
  }
}
