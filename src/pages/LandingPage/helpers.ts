import type { IterationData } from "../../helpers";
import {
  countStickersPoints,
  getBoardData,
  isRoughlyWithinColumn,
  isRoughlyWithinRow,
} from "../../helpers";
import type { SetState } from "../../interfaces";
import { BoardStatuses } from "../../constants";
import { getFrameWidget } from "../../miroHelpers";

export interface StateParam {
  setStatus: SetState<BoardStatuses>;
  setBoardStats: SetState<IterationData[]>;
}

export const handleValidate = async (frameId: string, state: StateParam) => {
  if (!frameId) {
    return;
  }

  const frame = await getFrameWidget(frameId);

  if (!frame) {
    return;
  }

  const { stickers, iterations, features } = await getBoardData(frame);

  const iterationStats: IterationData[] = [];
  // count iteration loads
  const isIterationsValid = iterations.reduce((acc, iteration) => {
    const stickersWithin = stickers.filter(
      (item) =>
        item.id !== iteration.id && isRoughlyWithinColumn(item, iteration),
    );

    const actualLoad = countStickersPoints(stickersWithin);

    const iterationName =
      iteration.text.match(/(?<name>I\d\.\d)/i)?.groups?.name;

    const iterationVelocity = Number(
      iteration.text.match(/vel: (?<count>\d+)/i)?.groups?.count ?? 0,
    );
    const iterationLoad = Number(
      iteration.text.match(/ld: (?<count>\d+)/i)?.groups?.count ?? 0,
    );

    const iterationDiff = Math.abs(iterationVelocity - actualLoad);

    if (iterationName) {
      iterationStats.push({
        name: iterationName,
        velocity: iterationVelocity,
        load: actualLoad,
        diff: iterationDiff,
      });
    }

    return acc && actualLoad === iterationLoad;
  }, true);

  // count feature sizes
  const isFeaturesValid = features.every((feature) => {
    const stickersWithin = stickers.filter(
      (item) => item.id !== feature.id && isRoughlyWithinRow(item, feature),
    );

    const count = countStickersPoints(stickersWithin);

    const featureCount = Number(
      feature.text.match(/size: (?<count>\d+)/i)?.groups?.count ?? 0,
    );

    return count === featureCount;
  });

  if (isIterationsValid && isFeaturesValid) {
    state.setStatus(BoardStatuses.Ok);
  } else {
    state.setStatus(BoardStatuses.Fail);
  }

  state.setBoardStats(iterationStats);
};
