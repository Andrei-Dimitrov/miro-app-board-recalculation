import type { IterationData, SetState } from "../../interfaces";
import { getBoardModel } from "../../helpers";
import { BoardStatuses } from "../../components/BoardStatus/constants";

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
