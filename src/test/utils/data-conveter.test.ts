import { DrawableRectangle } from "../../drawables";
import { Rectangle } from "../../models";
import { dataConverter } from "../../utils";
import { expect, test } from "vitest";

test("Смещенная точка первого прямоугольника подсоединения вызывает ошибку", () => {
  const firstRectangle = new DrawableRectangle(
    new Rectangle({
      position: { x: 1050, y: 650 },
      size: { width: 50, height: 50 },
    }),
    { point: { x: 107665, y: 678 }, angle: 0 },
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

  expect(() =>
    dataConverter(
      firstRectangle.model.rect,
      secondRectangle.model.rect,
      firstRectangle.connectionPoint,
      secondRectangle.connectionPoint
    )
  ).throws("Точка 1 не лежит ни на одной грани");
  expect(() =>
    dataConverter(
      firstRectangle.model.rect,
      secondRectangle.model.rect,
      firstRectangle.connectionPoint,
      secondRectangle.connectionPoint
    )
  ).throws("Точка 1 не лежит ни на одной грани");
});

test("Смещенная точка второго прямоугольника подсоединения вызывает ошибку", () => {
  const firstRectangle = new DrawableRectangle(
    new Rectangle({
      position: { x: 1050, y: 650 },
      size: { width: 50, height: 50 },
    }),
    { point: { x: 1075, y: 675 }, angle: 0 },
    "#afa",
    "#33f",
    "#000"
  );

  const secondRectangle = new DrawableRectangle(
    new Rectangle({
      position: { x: 1000, y: 400 },
      size: { width: 50, height: 50 },
    }),
    { point: { x: 949, y: 375 }, angle: 270 },
    "#afa",
    "#33f",
    "#000"
  );

  expect(() =>
    dataConverter(
      firstRectangle.model.rect,
      secondRectangle.model.rect,
      firstRectangle.connectionPoint,
      secondRectangle.connectionPoint
    )
  ).throws("Точка 2 не лежит ни на одной грани");
});

test("Заданный угол точки в 270° подсоединения первого прямоугольника на правой грани вызывает ошибку", () => {
  const firstRectangle = new DrawableRectangle(
    new Rectangle({
      position: { x: 1050, y: 650 },
      size: { width: 50, height: 50 },
    }),
    { point: { x: 1075, y: 650 }, angle: 270 },
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

  expect(() =>
    dataConverter(
      firstRectangle.model.rect,
      secondRectangle.model.rect,
      firstRectangle.connectionPoint,
      secondRectangle.connectionPoint
    )
  ).throws(
    `Заданный угол 270° прямоугольника ${JSON.stringify(
      firstRectangle.model.rect
    )} подсоединения не перпендикулярен грани`
  );
});

test("Заданный угол точки в 90° подсоединения второго прямоугольника на левой грани вызывает ошибку", () => {
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
    { point: { x: 975, y: 400 }, angle: 90 },
    "#afa",
    "#33f",
    "#000"
  );

  expect(() =>
    dataConverter(
      firstRectangle.model.rect,
      secondRectangle.model.rect,
      firstRectangle.connectionPoint,
      secondRectangle.connectionPoint
    )
  ).throws(
    `Заданный угол 90° прямоугольника ${JSON.stringify(
      secondRectangle.model.rect
    )} подсоединения не перпендикулярен грани`
  );
});

test("Заданный угол точки в 180° подсоединения первого прямоугольника на верхней грани вызывает ошибку", () => {
  const firstRectangle = new DrawableRectangle(
    new Rectangle({
      position: { x: 1050, y: 650 },
      size: { width: 50, height: 50 },
    }),
    { point: { x: 1050, y: 675 }, angle: 180 },
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

  expect(() =>
    dataConverter(
      firstRectangle.model.rect,
      secondRectangle.model.rect,
      firstRectangle.connectionPoint,
      secondRectangle.connectionPoint
    )
  ).throws(
    `Заданный угол 180° прямоугольника ${JSON.stringify(
      firstRectangle.model.rect
    )} подсоединения не перпендикулярен грани`
  );
});

test("Заданный угол точки в 0° подсоединения второго прямоугольника на нижней грани вызывает ошибку", () => {
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
    { point: { x: 1000, y: 375 }, angle: 0 },
    "#afa",
    "#33f",
    "#000"
  );

  expect(() =>
    dataConverter(
      firstRectangle.model.rect,
      secondRectangle.model.rect,
      firstRectangle.connectionPoint,
      secondRectangle.connectionPoint
    )
  ).throws(
    `Заданный угол 0° прямоугольника ${JSON.stringify(
      secondRectangle.model.rect
    )} подсоединения не перпендикулярен грани`
  );
});
