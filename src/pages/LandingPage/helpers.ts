import type { IterationData, SetState } from "../../interfaces";
import { getBoardModel } from "../../helpers";
import { BoardStatuses } from "../../components/BoardStatus/constants";
import { updateWidgets } from "../../miroHelpers";

export interface StateParam {
  setStatus: SetState<BoardStatuses>;
  setBoardStats: SetState<IterationData[]>;
}

export const handleValidate = async (frameId: string, state: StateParam) => {
  const model = await getBoardModel(frameId);

  if (!model) {
    return;
  }

  const { iterations, features } = model;

  const isIterationsValid = iterations.every((iteration) => {
    const actualLoad = iteration
      .getStickers()
      .reduce((acc, sticker) => acc + sticker.points, 0);

    return actualLoad === iteration.load;
  });

  const isFeaturesValid = features.every((feature) => {
    const actualSize = feature
      .getStickers()
      .reduce((acc, sticker) => acc + sticker.points, 0);

    return actualSize === feature.size;
  });

  if (isIterationsValid && isFeaturesValid) {
    state.setStatus(BoardStatuses.Ok);
  } else {
    state.setStatus(BoardStatuses.Fail);
  }

  const stats = iterations.map(({ name, load, velocity, getStickers }) => {
    const actualLoad = getStickers().reduce(
      (acc, sticker) => acc + sticker.points,
      0,
    );
    return {
      name,
      load: actualLoad,
      velocity,
      diff: Math.abs(load - velocity),
    };
  });

  state.setBoardStats(stats);
};

export const handleRecalculate = async (
  frameId: string,
  state: Pick<StateParam, "setStatus">,
) => {
  const model = await getBoardModel(frameId);

  if (!model) {
    return;
  }

  const { iterations, features } = model;

  // update iteration loads
  await Promise.all(
    iterations.map(async (iteration) => {
      const actualLoad = iteration
        .getStickers()
        .reduce((acc, sticker) => acc + sticker.points, 0);

      if (actualLoad === iteration.load) {
        // already up to date, skip this iteration
        return;
      }

      const newWidgetText = iteration.widget.text.replace(
        /(ld: \d+)/i,
        `LD: ${actualLoad}`,
      );
      const newWidgetTextColor =
        actualLoad > iteration.velocity ? "#ff0000" : "#ffffff";

      await updateWidgets({
        id: iteration.widget.id,
        text: newWidgetText,
        style: {
          textColor: newWidgetTextColor,
        },
      });
    }),
  );

  // update feature sizes
  await Promise.all(
    features.map(async (feature) => {
      const actualSize = feature
        .getStickers()
        .reduce((acc, sticker) => acc + sticker.points, 0);

      if (actualSize === feature.size) {
        // already up to date, skip this feature
        return;
      }

      const newWidgetText = feature.widget.text.replace(
        /(size: \d+)/i,
        `Size: ${actualSize}`,
      );

      await updateWidgets({
        id: feature.widget.id,
        text: newWidgetText,
      });
    }),
  );

  state.setStatus(BoardStatuses.Ok);
};
