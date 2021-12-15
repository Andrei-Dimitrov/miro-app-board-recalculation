import type {
  IFrameWidget,
  IShapeWidget,
  IStickerWidget,
  IWidget,
} from "../interfaces";

export const getWidgets = <T extends IWidget = IWidget>(
  type: string,
  options?: Record<string, unknown>,
): Promise<T[]> =>
  miro.board.widgets.get({
    type,
    ...options,
  });

export const getWidget = async <T extends IWidget = IWidget>(
  type: string,
  id: string,
  options?: Record<string, unknown>,
): Promise<T | undefined> => {
  const items = await getWidgets<T>(type, { id, ...options });

  return items[0];
};

export const getFrameWidgets = (options?: Record<string, unknown>) =>
  getWidgets<IFrameWidget>("frame", options);

export const getStickerWidgets = (options?: Record<string, unknown>) =>
  getWidgets<IStickerWidget>("sticker", options);

export const getShapeWidgets = (options?: Record<string, unknown>) =>
  getWidgets<IShapeWidget>("shape", options);

export const getFrameWidget = (id: string, options?: Record<string, unknown>) =>
  getWidget<IFrameWidget>("frame", id, options);

export const getStickerWidget = (
  id: string,
  options?: Record<string, unknown>,
) => getWidget<IStickerWidget>("sticker", id, options);

export const getShapeWidget = (id: string, options?: Record<string, unknown>) =>
  getWidget<IShapeWidget>("shape", id, options);

type UpdateWidgetsData = Record<string, unknown> & { id: string };

export const updateWidgets = (
  widgets: UpdateWidgetsData | UpdateWidgetsData[],
) => {
  const isValid = Array.isArray(widgets)
    ? widgets.every((widget) => !!widget && typeof widget === "object")
    : !!widgets && typeof widgets == "object";

  if (!isValid) {
    const error = new Error(
      `Unable to update widget! The payload is not an object: ${JSON.stringify(
        widgets,
      )}`,
    );
    console.error(error);

    return;
  }

  return miro.board.widgets.update(widgets);
};
