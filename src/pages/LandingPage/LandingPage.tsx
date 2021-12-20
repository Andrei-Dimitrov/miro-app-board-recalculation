import { useLocation, useNavigate } from "react-router";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import type { Option } from "../../components/Select";
import { Select } from "../../components/Select";
import { BoardStatus } from "../../components/BoardStatus";
import { BoardStats } from "../../components/BoardStats";
import { Button } from "../../components/Button";
import type { IterationData } from "../../interfaces";
import { BoardStatuses } from "../../components/BoardStatus/constants";
import { getFrameWidgets } from "../../miroHelpers";
import { handleValidate } from "./helpers";

import classes from "./LadningPage.module.css";

export const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultFrameId = new URLSearchParams(location.search).get("frameId");

  const [frameId, setFrameId] = useState(defaultFrameId ?? "");
  const [frameOptions, setFrameOptions] = useState<Option[]>([]);
  const [status, setStatus] = useState(BoardStatuses.Unknown);
  const [boardStats, setBoardStats] = useState<IterationData[]>([]);

  const onFrameIdChange = async (ev: ChangeEvent<HTMLSelectElement>) => {
    setFrameId(ev.target.value);

    await miro.broadcastData({ frameId, from: "sidebar" });
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
    <div className={classes.container}>
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
            <div className={classes.actionButtons}>
              <Button onClick={() => navigate("/export")}>Export to CSV</Button>
              <Button variant="success">Recalculate board</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
