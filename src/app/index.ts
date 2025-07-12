import { DrawableRectangle } from "../drawables";
import { Rectangle } from "../models";
import { zeroPoint, mapCanvasToLeftBottomZeroCoordinates, subtractPoints } from "../utils";
import { Node } from "../models";
import { InputService } from "../services";
import { pointInReactangle } from "../utils";
import type { Point, Rect } from "../types";
import { CONNECTION_POINT_SIZE } from "../constants";

export class Application {
  canvas: HTMLCanvasElement | undefined;

  areaNodes: Node[] = [];
  selectedNode: Node | null = null;
  selectedConnectionPointNode: Node | null = null;
  inputService: InputService;
  mouseDownCoordinates: Point | null = null;

  rafID = -1;

  constructor() {
    this.inputService = new InputService();
  }

  init() {
    const c = document.querySelector("#canvas");
    if (c) {
      this.canvas = document.querySelector("#canvas") as HTMLCanvasElement;
      this.canvas.width = document.documentElement.offsetWidth;
      this.canvas.height = document.documentElement.offsetHeight;
    } else {
      throw new Error("Canvas элемент не инициализирован");
    }

    const firstRectangle = new DrawableRectangle(
      new Rectangle({
        position: { x: 1050, y: 650 },
        size: { width: 50, height: 50 },
      }),
      { point: { x: 1075, y: 650 }, angle: 0 },
      "#afa",
      "#33f",
      "#000"
    );

    const secondRectangle = new DrawableRectangle(
      new Rectangle({
        position: { x: 1000, y: 400 },
        size: { width: 50, height: 50 },
      }),
      { point: { x: 1000, y: 375 }, angle: 270 },
      "#afa",
      "#33f",
      "#000"
    );

    const secondNode = new Node(secondRectangle, null, null);
    const firstNode = new Node(firstRectangle, secondNode, null);
    secondNode.adjacentNode = firstNode;
    firstNode.initializePathToAdjecentNode();

    this.areaNodes.push(firstNode, secondNode);

    this.inputService.addMouseDownCallback(
      this.onMouseDownAreaNodeSelect.bind(this)
    );

    this.inputService.addMouseMoveCallback(
      this.onMouseMoveSelectedAreaNode.bind(this)
    );

    this.inputService.addMouseUpCallback(
      this.onMouseUpAreaNodeSelect.bind(this)
    );
  }

  start() {
    this.rafID = requestAnimationFrame(this.render.bind(this));
  }

  render() {
    if (typeof this.canvas !== "undefined") {
      const ctx = this.canvas.getContext("2d");

      if (this.canvas && typeof ctx !== "undefined" && ctx !== null) {
        ctx.clearRect(
          0,
          0,
          document.documentElement.offsetWidth,
          document.documentElement.offsetHeight
        );

        for (const node of this.areaNodes) {
          if (node.adjacentNode && node.pathToAdjacentNode) {
            node.pathToAdjacentNode.draw(ctx);
          }
        }

        for (const node of this.areaNodes) {
          node.shape.draw(ctx);
        }
      }
    }
  }

  onMouseDownAreaNodeSelect(e: MouseEvent) {
    const coords = mapCanvasToLeftBottomZeroCoordinates({ x: e.clientX, y: e.clientY });

    for (const node of this.areaNodes) {
      if (node.shape instanceof DrawableRectangle) {
        const connectionPointRectangle: Rect = {
          position: node.shape.connectionPoint.point,
          size: { width: CONNECTION_POINT_SIZE, height: CONNECTION_POINT_SIZE },
        };

        if (pointInReactangle(connectionPointRectangle, coords)) {
          this.selectedConnectionPointNode = node;
          this.mouseDownCoordinates = coords;
          return;
        }

        if (pointInReactangle(node.shape.model.rect, coords)) {
          this.selectedNode = node;
          this.mouseDownCoordinates = coords;
        }
      }
    }
  }

  onMouseMoveSelectedAreaNode(e: MouseEvent) {
    if (this.mouseDownCoordinates) {
      if (this.selectedNode) {
        const currentMouseCoordinates: Point = mapCanvasToLeftBottomZeroCoordinates({
          x: e.clientX,
          y: e.clientY,
        });

        const mouseMoveDiffFromMouseDownOrigin = subtractPoints(
          currentMouseCoordinates,
          this.mouseDownCoordinates
        );

        this.selectedNode.assignTranslation(
          mouseMoveDiffFromMouseDownOrigin,
          zeroPoint()
        );

        this.selectedNode.createAdjacentNodePathWithTranslations();

        this.render();
      }

      if (
        this.selectedConnectionPointNode &&
        this.selectedConnectionPointNode.shape instanceof DrawableRectangle
      ) {
        const currentMouseCoordinates: Point = mapCanvasToLeftBottomZeroCoordinates({
          x: e.clientX,
          y: e.clientY,
        });

        const mouseMoveDiffFromMouseDownOrigin = subtractPoints(
          currentMouseCoordinates,
          this.mouseDownCoordinates
        );

        this.selectedConnectionPointNode.assignTranslation(
          zeroPoint(),
          mouseMoveDiffFromMouseDownOrigin
        );

        this.selectedConnectionPointNode.createAdjacentNodePathWithTranslations();
        this.render();
      }
    }
  }

  onMouseUpAreaNodeSelect() {
    if (this.selectedNode) {
      this.selectedNode.commitTranslation();
    }

    if (this.selectedConnectionPointNode) {
      this.selectedConnectionPointNode.commitTranslation();
    }

    this.selectedNode = null;
    this.selectedConnectionPointNode = null;
    this.mouseDownCoordinates = null;
  }
}
