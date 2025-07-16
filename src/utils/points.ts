import {
  addPoints,
  angleBetween,
  crossProduct,
  distance,
  multiplyPoints,
  normalize,
  rotatePoint,
  subtractPoints,
} from ".";
import {
  connectionAngeNotPerpendicularErrorText,
  CONNECTION_LINE_PADDING,
  EPSILON,
  CONNECTION_LINE_WIDTH,
} from "../constants";
import {
  PointNotOnTheEdgeError,
  ConnectionPointAngleNotPerpendicularError,
} from "../errors";
import type { Rect, ConnectionPoint, Point, Segment } from "../types";

export const pointOnTheSegment = (point: Point, e1: Point, e2: Point) => {
  const pointToEdge1 = subtractPoints(e1, point);
  const pointToEdge2 = subtractPoints(e2, point);

  const isBetweenX =
    Math.min(e1.x, e2.x) - EPSILON <= point.x &&
    point.x <= Math.max(e1.x, e2.x) + EPSILON;
  const isBetweenY =
    Math.min(e1.y, e2.y) - EPSILON <= point.y &&
    point.y <= Math.max(e1.y, e2.y) + EPSILON;

  const product = crossProduct(pointToEdge1, pointToEdge2);
  return product >= 0 && product <= EPSILON && isBetweenX && isBetweenY;
};

export const pointInReactangle = (
  rectangle: Rect,
  point: Point,
  excludeEdges = false
) => {
  const reactanglePoints = extractRectanglePoints(rectangle);

  const [leftTopPoint, _, rightBottomPoint] = reactanglePoints;

  let isBetweenX =
    Math.min(leftTopPoint.x, rightBottomPoint.x) <= point.x &&
    point.x <= Math.max(leftTopPoint.x, rightBottomPoint.x);
  let isBetweenY =
    Math.min(leftTopPoint.y, rightBottomPoint.y) <= point.y &&
    point.y <= Math.max(leftTopPoint.y, rightBottomPoint.y);

  if (excludeEdges) {
    isBetweenX =
      Math.min(leftTopPoint.x, rightBottomPoint.x) < point.x &&
      point.x < Math.max(leftTopPoint.x, rightBottomPoint.x);
    isBetweenY =
      Math.min(leftTopPoint.y, rightBottomPoint.y) < point.y &&
      point.y < Math.max(leftTopPoint.y, rightBottomPoint.y);
  }

  return isBetweenX && isBetweenY;
};

export const segmentsOverlap = (
  s1: Segment,
  s2: Segment
): Point | Segment | null => {
  const [A, B] = s1;
  const [C, D] = s2;

  // Векторы AB и CD
  const AB = { x: B.x - A.x, y: B.y - A.y };
  const CD = { x: D.x - C.x, y: D.y - C.y };

  // Вычисление знаменателя (определителя матрицы)
  const det = AB.x * CD.y - AB.y * CD.x;

  // Если определитель равен 0, отрезки параллельны или коллинеарны
  if (det === 0) {
    // Проверяем, лежат ли отрезки на одной прямой
    const isCollinear =
      A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y) === 0;
    if (!isCollinear) {
      return null; // Параллельны, но не на одной прямой
    }

    // Проверяем, есть ли общие точки (пересечение или наложение)
    const t0 =
      ((C.x - A.x) * AB.x + (C.y - A.y) * AB.y) / (AB.x * AB.x + AB.y * AB.y);
    const t1 =
      ((D.x - A.x) * AB.x + (D.y - A.y) * AB.y) / (AB.x * AB.x + AB.y * AB.y);

    const tStart = Math.min(t0, t1);
    const tEnd = Math.max(t0, t1);

    // Если отрезки не перекрываются
    if (tEnd < 0 || tStart > 1) {
      return null;
    }

    // Находим точки пересечения
    const overlapStart = Math.max(0, tStart);
    const overlapEnd = Math.min(1, tEnd);

    if (overlapStart === overlapEnd) {
      // Пересечение в одной точке
      const x = A.x + overlapStart * AB.x;
      const y = A.y + overlapStart * AB.y;
      return { x, y };
    } else {
      // Наложение (части отрезка совпадают)
      const start = {
        x: A.x + overlapStart * AB.x,
        y: A.y + overlapStart * AB.y,
      };
      const end = {
        x: A.x + overlapEnd * AB.x,
        y: A.y + overlapEnd * AB.y,
      };
      return [start, end];
    }
  }

  // Если отрезки не параллельны, находим точку пересечения
  const t = ((A.y - C.y) * CD.x - (A.x - C.x) * CD.y) / det;
  const u = -((A.y - C.y) * AB.x - (A.x - C.x) * AB.y) / det;

  // Проверяем, что точка пересечения лежит на обоих отрезках
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    const x = A.x + t * AB.x;
    const y = A.y + t * AB.y;
    return { x, y };
  }

  return null; // Отрезки не пересекаются
};

function dijkstra(
  points: Point[],
  startIndex: number,
  endIndex: number,
  r1: Rect,
  r2: Rect
) {
  const start = points[startIndex];
  const end = points[endIndex];

  // Создаём граф (список смежности)
  const graph = buildGraph(points, r1, r2);

  // Инициализация расстояний
  const distances = new Map();
  const previous = new Map();
  const visited = new Set();

  // Начальная точка
  distances.set(`${start.x},${start.y}`, 0);
  previous.set(`${start.x},${start.y}`, null);

  // Приоритетная очередь (можно использовать массив, но лучше бинарную кучу)
  const queue = [{ ...start, dist: 0 }];

  while (queue.length > 0) {
    // Находим точку с минимальным расстоянием (упрощённо, без оптимизированной очереди)
    queue.sort((a, b) => a.dist - b.dist);
    const current = queue.shift()!;
    const currentKey = `${current.x},${current.y}`;

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

    // Если дошли до конечной точки
    if (current.x === end.x && current.y === end.y) {
      return {
        path: reconstructPath(previous, end),
        distance: distances.get(currentKey),
      };
    }

    // Перебираем соседей
    const neighbors = graph.get(currentKey) || [];
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      const distance =
        distances.get(currentKey) + manhattanDistance(current, neighbor);

      if (distance < (distances.get(neighborKey) ?? Infinity)) {
        distances.set(neighborKey, distance);
        previous.set(neighborKey, current);
        queue.push({ ...neighbor, dist: distance });
      }
    }
  }

  return { path: [], distance: Infinity }; // Путь не найден
}

function manhattanDistance(a: Point, b: Point) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function reconstructPath(previous: Map<string, Point>, end: Point) {
  const path = [];
  let currentKey = `${end.x},${end.y}`;
  let current = previous.get(currentKey);

  while (current) {
    path.unshift({ x: current.x, y: current.y });
    currentKey = `${current.x},${current.y}`;
    current = previous.get(currentKey);
  }

  path.push({ x: end.x, y: end.y });
  return path;
}

function buildGraph(points: Point[], r1: Rect, r2: Rect) {
  const graph = new Map();

  const firstRectangleWithPaddingsEdges = extractRectangleEdges(r1);
  const secondRectangleWithPaddingsEdges = extractRectangleEdges(r2);

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const key = `${point.x},${point.y}`;
    graph.set(key, []);

    // Ищем точки на той же X-линии (вертикальные соединения)
    const sameX = points.filter((p) => p.x === point.x && p.y !== point.y);
    sameX.sort((a, b) => a.y - b.y);

    // Добавляем ближайшие по Y (без промежуточных точек), если пересечений не будет найдено у буферного квадрата, уменьшенного на 1, потому что пересечение самой грани считается тоже за пересечение и оно может отброситься, но оно нам нужно на исходном размере буферного квадрата

    for (const other of sameX) {
      let hasObstacle = 0;
      for (const e of firstRectangleWithPaddingsEdges) {
        const i = findFirstIntersection(other, point, [e]);
        const overlap = segmentsOverlap(e, [other, point]);

        if (i && !overlap) {
          hasObstacle += 1;
        }
      }

      for (const e of secondRectangleWithPaddingsEdges) {
        const i = findFirstIntersection(other, point, [e]);
        const overlap = segmentsOverlap(e, [other, point]);

        if (i && !overlap) {
          hasObstacle += 1;
        }
      }

      if (hasObstacle <= 1) {
        graph.get(key).push(other);
      }
    }

    // Ищем точки на той же Y-линии (горизонтальные соединения)
    const sameY = points.filter((p) => p.y === point.y && p.x !== point.x);
    sameY.sort((a, b) => a.x - b.x);

    // Добавляем ближайшие по X (без промежуточных точек)
    for (const other of sameY) {
      let hasObstacle = 0;

      for (const e of firstRectangleWithPaddingsEdges) {
        const i = findFirstIntersection(other, point, [e]);
        const overlap = segmentsOverlap(e, [other, point]);

        if (i && !overlap) {
          hasObstacle += 1;
        }
      }

      for (const e of secondRectangleWithPaddingsEdges) {
        const i = findFirstIntersection(other, point, [e]);
        const overlap = segmentsOverlap(e, [other, point]);

        if (i && !overlap) {
          hasObstacle += 1;
        }
      }

      if (hasObstacle <= 1) {
        graph.get(key).push(other);
      }
    }
  }

  return graph;
}

export const findIntersection = (
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
) => {
  const { x: x1, y: y1 } = p1;
  const { x: x2, y: y2 } = p2;
  const { x: x3, y: y3 } = p3;
  const { x: x4, y: y4 } = p4;

  // Вектора AB и CD
  const v1x = x2 - x1;
  const v1y = y2 - y1;
  const v2x = x4 - x3;
  const v2y = y4 - y3;

  // Определитель (векторное произведение)
  const det = v1x * v2y - v1y * v2x;

  // Если определитель 0 — отрезки параллельны или коллинеарны
  if (Math.abs(det) < EPSILON) {
    return null;
  }

  // Параметры t и u для параметрических уравнений
  const dx = x3 - x1;
  const dy = y3 - y1;
  const t = (dx * v2y - dy * v2x) / det;
  const u = (dx * v1y - dy * v1x) / det;

  // Проверка, что точка пересечения лежит внутри обоих отрезков
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * v1x,
      y: y1 + t * v1y,
    };
  }

  return null;
};

export const findFirstIntersection = (
  p1: Point,
  p2: Point,
  segments: Array<[Point, Point]>
) => {
  const { x: x1, y: y1 } = p1;

  let closestIntersection = null;
  let minDistance = Infinity;

  for (const segment of segments) {
    const [p3, p4] = segment;

    const intersection = findIntersection(p1, p2, p3, p4);

    if (intersection) {
      // Расстояние от A до точки пересечения
      const dx = intersection.x - x1;
      const dy = intersection.y - y1;
      const distance = dx * dx + dy * dy; // Квадрат расстояния (для оптимизации)

      if (distance < minDistance) {
        minDistance = distance;
        closestIntersection = {
          point: intersection,
          segment: segment,
        };
      }
    }
  }

  return closestIntersection;
};

export const extractRectanglePoints = ({ position, size }: Rect) => {
  const halfWidth = size.width / 2;
  const halfHeight = size.height / 2;

  const leftTopPoint = {
    x: position.x - halfWidth,
    y: position.y + halfHeight,
  };
  const rightTopPoint = {
    x: position.x + halfWidth,
    y: position.y + halfHeight,
  };
  const leftBottomPoint = {
    x: position.x - halfWidth,
    y: position.y - halfHeight,
  };
  const rightBottomPoint = {
    x: position.x + halfWidth,
    y: position.y - halfHeight,
  };

  return [leftTopPoint, rightTopPoint, rightBottomPoint, leftBottomPoint];
};

export const pointsEquals = (p1: Point, p2: Point) => {
  return Math.abs(p1.x - p2.x) < EPSILON && Math.abs(p1.y - p2.y) < EPSILON;
};

export const dataConverter = (
  rect1: Rect,
  rect2: Rect,
  cPoint1: ConnectionPoint,
  cPoint2: ConnectionPoint
) => {
  const rect1Edges: Array<[Point, Point]> = extractRectangleEdges(rect1);
  const rect2Edges: Array<[Point, Point]> = extractRectangleEdges(rect2);

  let c1PointEdgeFound = false;
  let c1PointEdge = rect1Edges[0];

  for (const edge of rect1Edges) {
    const [e1, e2] = edge;
    if (pointOnTheSegment(cPoint1.point, e1, e2)) {
      c1PointEdgeFound = true;
      c1PointEdge = edge;
      break;
    }
  }

  if (!c1PointEdgeFound) {
    throw new PointNotOnTheEdgeError("Точка 1 не лежит ни на одной грани");
  }

  let c2PointEdgeFound = false;
  let c2PointEdge = rect2Edges[0];

  for (const edge of rect2Edges) {
    const [e1, e2] = edge;

    if (pointOnTheSegment(cPoint2.point, e1, e2)) {
      c2PointEdgeFound = true;
      c2PointEdge = edge;
      break;
    }
  }

  if (!c2PointEdgeFound) {
    throw new PointNotOnTheEdgeError("Точка 2 не лежит ни на одной грани");
  }

  if (cPoint1.angle % 90 !== 0) {
    throw new ConnectionPointAngleNotPerpendicularError(
      `Заданный угол ${cPoint1.angle}° первого прямоугольника подсоединения не перпендикулярен грани`
    );
  }

  if (cPoint2.angle % 90 !== 0) {
    throw new ConnectionPointAngleNotPerpendicularError(
      `Заданный угол ${cPoint2.angle}° второго прямоугольника подсоединения не перпендикулярен грани`
    );
  }

  const zeroDegreeVector: Point = { x: 1, y: 0 };

  const normalizedConnectionEdgeRect1 = normalize(
    subtractPoints(c1PointEdge[1], c1PointEdge[0])
  );

  let rotatedEdgeWithConnectionPoint = normalize(
    rotatePoint(normalizedConnectionEdgeRect1, 90, false, true)
  );

  let angleBetweenRotatedEdgeWithConnectionPointAndZeroDegreeVector =
    angleBetween(zeroDegreeVector, rotatedEdgeWithConnectionPoint, true, false);

  if (
    angleBetweenRotatedEdgeWithConnectionPointAndZeroDegreeVector !==
      cPoint1.angle &&
    !pointIsRectangleCorner(cPoint1.point, rect1)
  ) {
    throw new ConnectionPointAngleNotPerpendicularError(
      connectionAngeNotPerpendicularErrorText(cPoint1.angle, rect1)
    );
  }

  const normalizedConnectionEdgeRect2 = normalize(
    subtractPoints(c2PointEdge[1], c2PointEdge[0])
  );

  rotatedEdgeWithConnectionPoint = normalize(
    rotatePoint(normalizedConnectionEdgeRect2, 90, false, true)
  );

  angleBetweenRotatedEdgeWithConnectionPointAndZeroDegreeVector = angleBetween(
    zeroDegreeVector,
    rotatedEdgeWithConnectionPoint,
    true,
    false
  );

  if (
    angleBetweenRotatedEdgeWithConnectionPointAndZeroDegreeVector !==
      cPoint2.angle &&
    !pointIsRectangleCorner(cPoint2.point, rect2)
  ) {
    throw new ConnectionPointAngleNotPerpendicularError(
      connectionAngeNotPerpendicularErrorText(cPoint2.angle, rect2)
    );
  }

  /**
   * 1. Строятся два квадрата буферной зоны вокруг исходного, по ширине больше на длину выходящего отрезка под углом из исходных данных.
   * Квадрат, очерчивающий всю зону вместе с буферными и исходными (на углах минимальном и максимальном буферных квадратов).
   * Еще один квадрат на точках выходящих из точки соединения на ширину из конфига.
   * Последние два квадрата: первый строится на точке выходящей из точки соединения, расстояние которой до начала координат минимально и точки квадрата буферной зоны, расстояние которой максимально от начала координат, второй строится на точке выходящей из точки соединения, расстояние которой до начала координат максимально и точки квадрата буферной зоны, расстояние которой минимально от начала координат.
   * 2. Ищутся всевозможные пересечния и наложения отрезков этих квадратов друг с другом.
   * 3. Строится граф по этим точкам, в котором все связи только вертикальные или горизонтальные, в данном случае получается неравномерная сетка по расстоянию между узлами. Для исключения пересечения буферного квадрата насквозь, уменьшается исходный буферный квадрат по размеру на ширину линии из конфига.
   * 4. Алгоритмом дейкстры ищется кратчайший путь на этом графе с учетом того, что каждый путь не пересекает буферные квадраты, уменьшенные на единицу по размерам, для того, чтобы отрезок не прижимался к граням исходных прямоугольников, а к граням буферных квадратов.
   */

  const unitVector: Point = { x: 1, y: 0 };

  const connectionLineVector = {
    x: CONNECTION_LINE_PADDING,
    y: CONNECTION_LINE_PADDING,
  };

  const startPoint: Point = addPoints(
    multiplyPoints(
      normalize(rotatePoint(unitVector, cPoint1.angle, false, true)),
      connectionLineVector
    ),
    cPoint1.point
  );

  const endPoint: Point = addPoints(
    multiplyPoints(
      normalize(rotatePoint(unitVector, cPoint2.angle, false, true)),
      connectionLineVector
    ),
    cPoint2.point
  );

  const startEndPointsDiff = subtractPoints(endPoint, startPoint);

  const firstRectangleWithPaddings: Rect = {
    size: {
      width: rect1.size.width + 2 * CONNECTION_LINE_PADDING,
      height: rect1.size.height + 2 * CONNECTION_LINE_PADDING,
    },
    position: rect1.position,
  };

  const secondRectangleWithPaddings: Rect = {
    size: {
      width: rect2.size.width + 2 * CONNECTION_LINE_PADDING,
      height: rect2.size.height + 2 * CONNECTION_LINE_PADDING,
    },
    position: rect2.position,
  };

  const firstRectangleWithPaddingsPoints = extractRectanglePoints(
    firstRectangleWithPaddings
  );

  const firstRectangleWithPaddingsEdges = extractRectangleEdges(
    firstRectangleWithPaddings
  );

  const secondRectangleWithPaddingsPoints = extractRectanglePoints(
    secondRectangleWithPaddings
  );

  const secondRectangleWithPaddingsEdges = extractRectangleEdges(
    secondRectangleWithPaddings
  );

  const xMin = Math.min(
    ...firstRectangleWithPaddingsPoints.map((p) => p.x),
    ...secondRectangleWithPaddingsPoints.map((p) => p.x)
  );
  const xMax = Math.max(
    ...firstRectangleWithPaddingsPoints.map((p) => p.x),
    ...secondRectangleWithPaddingsPoints.map((p) => p.x)
  );

  const yMin = Math.min(
    ...firstRectangleWithPaddingsPoints.map((p) => p.y),
    ...secondRectangleWithPaddingsPoints.map((p) => p.y)
  );
  const yMax = Math.max(
    ...firstRectangleWithPaddingsPoints.map((p) => p.y),
    ...secondRectangleWithPaddingsPoints.map((p) => p.y)
  );

  const distanceZeroToStart = distance(startPoint, zeroPoint());
  const distanceZeroToEnd = distance(startPoint, zeroPoint());

  const minPointStartEnd =
    distanceZeroToStart < distanceZeroToEnd ? startPoint : endPoint;

  const maxPointStartEnd =
    distanceZeroToStart < distanceZeroToEnd ? endPoint : startPoint;

  const minConnectionPointMaxAreaRectangle: Rect = {
    position: {
      x: (minPointStartEnd.x + xMax) / 2,
      y: (minPointStartEnd.y + yMax) / 2,
    },
    size: {
      width: Math.abs(minPointStartEnd.x - xMax),
      height: Math.abs(minPointStartEnd.y - yMax),
    },
  };

  const maxConnectionPointMaxAreaRectangle: Rect = {
    position: {
      x: (maxPointStartEnd.x + xMin) / 2,
      y: (maxPointStartEnd.y + yMin) / 2,
    },
    size: {
      width: Math.abs(maxPointStartEnd.x - xMin),
      height: Math.abs(maxPointStartEnd.y - yMin),
    },
  };

  const minConnectionPointMaxAreaRectangleEdges = extractRectangleEdges(
    minConnectionPointMaxAreaRectangle
  );

  const maxConnectionPointMaxAreaRectangleEdges = extractRectangleEdges(
    maxConnectionPointMaxAreaRectangle
  );

  const nodesAreaDiagonal = subtractPoints(
    { x: xMin, y: yMin },
    { x: xMax, y: yMax }
  );

  const nodesAreaCenter = {
    x: xMin + Math.abs(nodesAreaDiagonal.x / 2),
    y: yMin + Math.abs(nodesAreaDiagonal.y / 2),
  };

  const nodesAreaRectangle: Rect = {
    position: nodesAreaCenter,
    size: { width: xMax - xMin, height: yMax - yMin },
  };

  const nodesAreaRectangleEdges = extractRectangleEdges(nodesAreaRectangle);

  const startEndPointsRectangle: Rect = {
    position: {
      x:
        Math.min(startPoint.x, endPoint.x) + Math.abs(startEndPointsDiff.x / 2),
      y:
        Math.min(startPoint.y, endPoint.y) + Math.abs(startEndPointsDiff.y / 2),
    },
    size: {
      width: Math.abs(startEndPointsDiff.x),
      height: Math.abs(startEndPointsDiff.y),
    },
  };

  const startEndPointsRectangleEdges = extractRectangleEdges(
    startEndPointsRectangle
  );

  const allEdges = [
    ...firstRectangleWithPaddingsEdges,
    ...secondRectangleWithPaddingsEdges,
    ...startEndPointsRectangleEdges,
    ...nodesAreaRectangleEdges,
    ...minConnectionPointMaxAreaRectangleEdges,
    ...maxConnectionPointMaxAreaRectangleEdges,
  ];

  const pointsAndSegmentsOverlaps = [];
  for (let i = 0; i < allEdges.length; i++) {
    const currentEdge = allEdges[i];

    for (let j = 0; j < allEdges.length; j++) {
      if (currentEdge === allEdges[j]) {
        continue;
      }

      const result = segmentsOverlap(currentEdge, allEdges[j]);

      if (Array.isArray(result)) {
        pointsAndSegmentsOverlaps.push(...result);
        continue;
      }

      if (result) {
        pointsAndSegmentsOverlaps.push(result);
      }
    }
  }

  const filtered = [
    ...new Map(
      pointsAndSegmentsOverlaps.map((item) => [`${item.x},${item.y}`, item])
    ).values(),
  ].filter(
    (p) =>
      !pointInReactangle(firstRectangleWithPaddings, p, true) &&
      !pointInReactangle(secondRectangleWithPaddings, p, true)
  );

  const path = dijkstra(
    filtered,
    filtered.findIndex((p) => p.x === startPoint.x && p.y === startPoint.y),
    filtered.findIndex((p) => p.x === endPoint.x && p.y === endPoint.y),
    changeRectangleSize(firstRectangleWithPaddings, -CONNECTION_LINE_WIDTH / 2),
    changeRectangleSize(secondRectangleWithPaddings, -CONNECTION_LINE_WIDTH / 2)
  ).path;

  return [cPoint1.point, ...path, cPoint2.point];
};

export const changeRectangleSize = (r: Rect, changeBy: number) => {
  return {
    ...r,
    size: {
      width: r.size.width + changeBy,
      height: r.size.height + changeBy,
    },
  };
};

export const extractRectangleEdges = (r: Rect): Segment[] => {
  const points = extractRectanglePoints(r);

  return [
    [points[0], points[1]],
    [points[1], points[2]],
    [points[2], points[3]],
    [points[3], points[0]],
  ];
};

export const isEmptyPoint = (p: Point): boolean => {
  return p.x === 0 && p.y === 0;
};

export const zeroPoint = (): Point => ({ x: 0, y: 0 });

export const pointIsRectangleCorner = (p: Point, r: Rect) => {
  const rectanglePoints = extractRectanglePoints(r);

  for (const corner of rectanglePoints) {
    if (p.x === corner.x && p.y === corner.y) {
      return true;
    }
  }

  return false;
};
