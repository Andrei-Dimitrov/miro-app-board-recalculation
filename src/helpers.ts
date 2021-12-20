import type { IShapeWidget, IStickerWidget, IWidget } from "./interfaces";
import {
  getFrameWidget,
  getShapeWidgets,
  getStickerWidgets,
  updateWidgets,
} from "./miroHelpers";

export const isWithinColumn = (item: IWidget, parent: IWidget) =>
  item.bounds.left >= parent.bounds.left &&
  item.bounds.right <= parent.bounds.right;

export const isWithinRow = (item: IWidget, parent: IWidget) =>
  item.bounds.top >= parent.bounds.top &&
  item.bounds.bottom <= parent.bounds.bottom;

export const isWithinCell = (item: IWidget, parent: IWidget) => {
  return isWithinColumn(item, parent) && isWithinRow(item, parent);
};

export const isRoughlyWithinColumn = (item: IWidget, parent: IWidget) => {
  if (isWithinColumn(item, parent)) {
    return true;
  }

  const itemCenter = item.bounds.width / 2;

  // case when the item is almost inside the parent from the left side: [ |    ] |
  // where: [ ] - item, | | - parent
  if (
    item.bounds.left <= parent.bounds.left &&
    item.bounds.right >= parent.bounds.left &&
    item.bounds.right <= parent.bounds.right
  ) {
    return item.bounds.right - parent.bounds.left >= itemCenter;
  }

  // case when the item is almost inside the parent from the right side: | [    | ]
  // where: [ ] - item, | | - parent
  if (
    item.bounds.left >= parent.bounds.left &&
    item.bounds.left <= parent.bounds.right &&
    item.bounds.right >= parent.bounds.right
  ) {
    return parent.bounds.right - item.bounds.left >= itemCenter;
  }

  return false;
};

export const isRoughlyWithinRow = (item: IWidget, parent: IWidget) => {
  if (isWithinRow(item, parent)) {
    return true;
  }

  const itemCenter = item.bounds.height / 2;

  // case when the item is almost inside the parent from the top side
  if (
    item.bounds.top <= parent.bounds.top &&
    item.bounds.bottom >= parent.bounds.top &&
    item.bounds.bottom <= parent.bounds.bottom
  ) {
    return item.bounds.bottom - parent.bounds.top >= itemCenter;
  }

  // case when the item is almost inside the parent from the bottom side
  if (
    item.bounds.bottom >= parent.bounds.bottom &&
    item.bounds.top <= parent.bounds.bottom &&
    item.bounds.top >= parent.bounds.top
  ) {
    return parent.bounds.bottom - item.bounds.top >= itemCenter;
  }

  return false;
};

export interface FeatureModel {
  // may not be present, e.g. for CO stories
  id?: string;
  name: string;
  size: number;
  color: string;
  widget: IShapeWidget;
  getStickers: () => StickerModel[];
  updateWidget: (options: Record<string, unknown>) => Promise<void>;
}

export interface StickerModel {
  text: string;
  points: number;
  widget: IStickerWidget;
  getIteration: () => IterationModel | undefined;
  getFeature: () => FeatureModel | undefined;
  getPredecessors: () => StickerModel[];
  getSuccessors: () => StickerModel[];
  updateWidget: (options: Record<string, unknown>) => Promise<void>;
}

export interface IterationModel {
  name: string;
  velocity: number;
  load: number;
  widget: IShapeWidget;
  getStickers: () => StickerModel[];
  updateWidget: (options: Record<string, unknown>) => Promise<void>;
}

export interface BoardModel {
  iterations: IterationModel[];
  stickers: StickerModel[];
  features: FeatureModel[];
}

export const getBoardModel = async (frameId: string) => {
  if (!frameId) {
    return;
  }

  const frame = await getFrameWidget(frameId);

  if (!frame) {
    return;
  }

  const allStickerWidgets = await getStickerWidgets();

  const allShapeWidgets = await getShapeWidgets();

  const iterationWidgets = allShapeWidgets
    .filter((item) => isWithinCell(item, frame))
    .filter((shape) => /vel: \d+\s+ld: \d+/i.test(shape.plainText));

  const featureWidgets = allShapeWidgets
    .filter((item) => isWithinCell(item, frame))
    .filter((shape) => /size: \d+/i.test(shape.plainText));

  const stickersWidgets = allStickerWidgets.filter((item) =>
    isWithinCell(item, frame),
  );

  const createIterationModel = (
    iterationWidget: IShapeWidget,
  ): IterationModel => {
    const name =
      iterationWidget.text.match(/(?<name>I\d\.\d)/i)?.groups?.name ??
      "unknown";

    const velocity = Number(
      iterationWidget.text.match(/vel: (?<count>\d+)/i)?.groups?.count ?? 0,
    );
    const load = Number(
      iterationWidget.text.match(/ld: (?<count>\d+)/i)?.groups?.count ?? 0,
    );

    return {
      name,
      velocity,
      load,
      widget: iterationWidget,
      getStickers: () => {
        return stickers.filter(({ widget }) =>
          isRoughlyWithinColumn(widget, iterationWidget),
        );
      },
      async updateWidget(options) {
        await updateWidgets({
          id: iterationWidget.id,
          ...options,
        });
      },
    };
  };

  const createFeatureModel = (featureWidget: IShapeWidget): FeatureModel => {
    const sizeRegex = /size: (?<size>\d+)/i;
    const name = featureWidget.text.replace(sizeRegex, "").trim();
    const size = Number(featureWidget.text.match(sizeRegex)?.groups?.size ?? 0);
    const color = featureWidget.style?.backgroundColor?.toString() ?? "#808080";
    const id = featureWidget.plainText.match(/(?<uid>F\d+)/i)?.groups?.uid;

    return {
      id,
      name,
      size,
      color,
      widget: featureWidget,
      getStickers() {
        return stickers.filter(({ widget }) =>
          isRoughlyWithinRow(widget, featureWidget),
        );
      },
      async updateWidget(options) {
        await updateWidgets({
          id: featureWidget.id,
          ...options,
        });
      },
    };
  };

  const createStickerModel = (stickerWidget: IStickerWidget): StickerModel => {
    const pointsRegex = /(?<points>\d+)pt/;
    const text = stickerWidget.plainText.replace(pointsRegex, "").trim();
    const points = Number(
      stickerWidget.plainText.match(pointsRegex)?.groups?.points ?? 0,
    );

    return {
      text,
      points,
      widget: stickerWidget,
      getIteration() {
        return iterations.find(({ widget }) =>
          isRoughlyWithinColumn(stickerWidget, widget),
        );
      },
      getFeature() {
        return features.find(({ widget }) =>
          isRoughlyWithinRow(stickerWidget, widget),
        );
      },
      getPredecessors: () => {
        return [];
      },
      getSuccessors: () => {
        return [];
      },
      async updateWidget(options) {
        await updateWidgets({
          id: stickerWidget.id,
          ...options,
        });
      },
    };
  };

  const iterations = iterationWidgets.map(createIterationModel);
  const features = featureWidgets.map(createFeatureModel);
  const stickers = stickersWidgets.map(createStickerModel);

  const model: BoardModel = {
    iterations,
    features,
    stickers,
  };

  return model;
};
