import { useParams } from "react-router";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import type { Option } from "../../components/Select";
import { Select } from "../../components/Select";
import { getFrameWidgets } from "../../miroHelpers";
import { BoardStatus } from "../../components/BoardStatus";
import { BoardStatuses } from "../../constants";
import { BoardStats } from "../../components/BoardStats";
import type { IterationData } from "../../helpers";
import { Button } from "../../components/Button";
import { handleValidate } from "./helpers";

export const LandingPage = () => {
  const { frameId: defaultFrameId } = useParams();
  const [frameId, setFrameId] = useState(defaultFrameId ?? "");
  const [frameOptions, setFrameOptions] = useState<Option[]>([]);
  const [status, setStatus] = useState(BoardStatuses.Unknown);
  const [boardStats, setBoardStats] = useState<IterationData[]>([]);

  const onFrameIdChange = (ev: ChangeEvent<HTMLSelectElement>) => {
    setFrameId(ev.target.value);
  };

  useEffect(() => {
    const effect = async () => {
      const frameWidgets = await getFrameWidgets();
      setFrameOptions(
        frameWidgets.map((frame) => ({ text: frame.title, value: frame.id })),
      );
    };

    effect();
  }, []);

  useEffect(() => {
    const timerId = setTimeout(
      () =>
        handleValidate(frameId, {
          setStatus,
          setBoardStats,
        }),
      1000,
    );

    return () => clearTimeout(timerId);
  }, [frameId]);

  return (
    <>
      <div>
        <h1 className="header">Miro App Board Recalculation</h1>
        <div id="container">
          <label>
            <strong>Board Frame:</strong>
            <Select
              value={frameId}
              placeholder="Select your board..."
              options={frameOptions}
              onChange={onFrameIdChange}
            />
          </label>
          {!frameId && <p>Select the board from the list to start.</p>}
          {frameId && (
            <>
              <BoardStatus status={status} />
              <BoardStats data={boardStats} />
              <div>
                <Button title="To be done">Export to CSV</Button>
                <Button variant="success">Recalculate board</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
